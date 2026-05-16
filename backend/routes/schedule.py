from fastapi import APIRouter
from services.mock_data import schedule_db

router = APIRouter()


@router.get("/")
def get_schedule():
    """Mevcut nöbet/izin çizelgesini döner."""
    return {"status": "success", "data": schedule_db}
