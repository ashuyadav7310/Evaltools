from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, StringConstraints
from sqlalchemy.orm import Session
from typing import Annotated, Literal, Optional

from auth import require_trainer_access
from database import Interview, Test, get_db

router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class RubricSchema(BaseModel):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
    description: Optional[Annotated[str, StringConstraints(strip_whitespace=True)]] = None


class CreateTestRequest(BaseModel):
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3)]
    participantContext: Annotated[str, StringConstraints(strip_whitespace=True, min_length=10)]
    context: Annotated[str, StringConstraints(strip_whitespace=True, min_length=10)]
    category: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
    inputMode: Literal["audio", "text"] = "audio"
    rounds: Optional[int] = Field(default=3, ge=1, le=10)
    rubrics: list[RubricSchema] = Field(min_length=1)


class UpdateTestRequest(BaseModel):
    title: Optional[Annotated[str, StringConstraints(strip_whitespace=True, min_length=3)]] = None
    participantContext: Optional[Annotated[str, StringConstraints(strip_whitespace=True, min_length=10)]] = None
    context: Optional[Annotated[str, StringConstraints(strip_whitespace=True, min_length=10)]] = None
    category: Optional[Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]] = None
    inputMode: Optional[Literal["audio", "text"]] = None
    rounds: Optional[int] = Field(default=None, ge=1, le=10)
    rubrics: Optional[list[RubricSchema]] = None


def _serialize_test(test: Test) -> dict:
    return {
        "id": test.id,
        "title": test.title,
        "participantContext": test.participant_context,
        "context": test.context,
        "category": test.category,
        "inputMode": test.input_mode,
        "rounds": test.rounds,
        "rubrics": test.rubrics,
        "createdAt": test.created_at,
        "updatedAt": test.updated_at,
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get("/tests")
def list_tests(
    _: None = Depends(require_trainer_access),
    db: Session = Depends(get_db),
):
    tests = db.query(Test).order_by(Test.created_at).all()
    return [_serialize_test(test) for test in tests]


@router.post("/tests", status_code=201)
def create_test(
    body: CreateTestRequest,
    _: None = Depends(require_trainer_access),
    db: Session = Depends(get_db),
):
    test = Test(
        title=body.title,
        participant_context=body.participantContext,
        context=body.context,
        category=body.category,
        input_mode=body.inputMode,
        rounds=body.rounds or 3,
        rubrics=[r.model_dump() for r in body.rubrics],
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return _serialize_test(test)


@router.get("/tests/{test_id}")
def get_test(
    test_id: int,
    _: None = Depends(require_trainer_access),
    db: Session = Depends(get_db),
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return _serialize_test(test)


@router.put("/tests/{test_id}")
def update_test(
    test_id: int,
    body: UpdateTestRequest,
    _: None = Depends(require_trainer_access),
    db: Session = Depends(get_db),
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    if body.title is not None:
        test.title = body.title
    if body.participantContext is not None:
        test.participant_context = body.participantContext
    if body.context is not None:
        test.context = body.context
    if body.category is not None:
        test.category = body.category
    if body.inputMode is not None:
        test.input_mode = body.inputMode
    if body.rounds is not None:
        test.rounds = body.rounds
    if body.rubrics is not None:
        test.rubrics = [r.model_dump() for r in body.rubrics]

    db.commit()
    db.refresh(test)
    return _serialize_test(test)


@router.delete("/tests/{test_id}", status_code=204)
def delete_test(
    test_id: int,
    _: None = Depends(require_trainer_access),
    db: Session = Depends(get_db),
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    has_interviews = db.query(Interview.id).filter(Interview.test_id == test_id).first()
    if has_interviews:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a test that already has interview sessions",
        )

    db.delete(test)
    db.commit()
