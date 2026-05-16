from fastapi import APIRouter
from services.mock_data import personnel_db

router = APIRouter()


@router.get("/")
def get_personnel():
    """Tüm personeli ve uygunluk/nöbet durumlarını listeler."""
    return {"status": "success", "data": personnel_db}
