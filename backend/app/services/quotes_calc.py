from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from backend.app.db.models import ItemObra, ItemObraCosto, Incremento, Obra, Cotizacion


def calcular_totales_cotizacion(db: Session, id_cotizacion: int) -> tuple[Decimal, Decimal, list[tuple[int, Decimal, Decimal, Decimal]]]:
    items = db.scalars(
        select(ItemObra).join(Obra, ItemObra.id_obra == Obra.id_obra).where(Obra.id_cotizacion == id_cotizacion)
    ).all()

    resultados: list[tuple[int, Decimal, Decimal, Decimal]] = []
    subtotal_general = Decimal("0")

    for item in items:
        subtotal_costos = db.scalar(
            select(func.coalesce(func.sum(ItemObraCosto.total_linea), 0)).where(ItemObraCosto.id_item_obra == item.id_item_obra)
        )
        subtotal_costos = Decimal(subtotal_costos)
        total_incrementos = db.scalar(
            select(func.coalesce(func.sum(Incremento.porcentaje), 0)).where(Incremento.id_item_obra == item.id_item_obra)
        )
        total_incrementos = Decimal(total_incrementos) / Decimal("100")
        total_item = subtotal_costos * (Decimal("1") + total_incrementos)

        resultados.append((item.id_item_obra, subtotal_costos, total_incrementos, total_item))
        subtotal_general += total_item

    return subtotal_general, subtotal_general, resultados




