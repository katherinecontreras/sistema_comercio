from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors


def generar_pdf_planilla(datos: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Planilla de Cotización", styles["Title"]))
    story.append(Spacer(1, 12))

    cliente = datos.get("cliente", {})
    cabecera = f"Cliente: {cliente.get('razon_social', '')}  |  Proyecto: {datos.get('nombre_proyecto', '')}"
    story.append(Paragraph(cabecera, styles["Normal"]))
    story.append(Spacer(1, 12))

    # Tabla de ítems
    rows = [["Código", "Descripción", "Unidad", "Cantidad", "Subtotal", "% Inc.", "Total"]]
    for item in datos.get("items", []):
        rows.append([
            item.get("codigo", ""),
            item.get("descripcion_tarea", ""),
            item.get("unidad", ""),
            f"{item.get('cantidad', 0):.2f}",
            f"{item.get('subtotal_costos', 0):.2f}",
            f"{item.get('total_incrementos', 0)*100:.2f}",
            f"{item.get('total_item', 0):.2f}",
        ])

    table = Table(rows, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ALIGN", (3, 1), (-1, -1), "RIGHT"),
            ]
        )
    )

    story.append(table)
    story.append(Spacer(1, 12))

    totales = datos.get("totales", {})
    story.append(Paragraph(f"Subtotal General: {totales.get('subtotal_general', 0):.2f}", styles["Heading3"]))
    story.append(Paragraph(f"Total General: {totales.get('total_general', 0):.2f}", styles["Heading3"]))

    doc.build(story)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf




