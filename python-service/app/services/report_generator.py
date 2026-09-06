from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER
import io
from datetime import datetime

def generate_pdf(data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )
    styles = getSampleStyleSheet()
    story = []
    
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontSize=24, textColor=colors.HexColor('#6366F1'), spaceAfter=10)
    heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading1'], fontSize=14, textColor=colors.HexColor('#111827'), spaceAfter=8, spaceBefore=14)
    body_style = ParagraphStyle('CustomBody', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#374151'), spaceAfter=6)
    
    story.append(Paragraph("DataForge", title_style))
    story.append(Paragraph("Data Quality Validation Report", styles['Heading2']))
    story.append(Spacer(1, 0.4*cm))
    
    dataset = data.get('dataset', {})
    story.append(Paragraph(f"Dataset: {dataset.get('name', 'Unknown')}", body_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}", body_style))
    story.append(Paragraph(f"Generated for: {data.get('userName', 'DataForge User')}", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E5E7EB')))
    story.append(Spacer(1, 0.4*cm))
    
    story.append(Paragraph("Dataset Overview", heading_style))
    overview_data = [
        ['Property', 'Value'],
        ['Rows', str(dataset.get('rows', 'N/A'))],
        ['Columns', str(dataset.get('columns', 'N/A'))],
        ['File Type', str(dataset.get('name', '').split('.')[-1].upper())],
        ['Upload Date', str(dataset.get('createdAt', 'N/A'))[:10]],
    ]
    table = Table(overview_data, colWidths=[5*cm, 10*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366F1')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(table)
    story.append(Spacer(1, 0.5*cm))
    
    result = data.get('processingResult', {})
    score = result.get('qualityScore', {})
    if score:
        story.append(Paragraph("Data Quality Score Breakdown", heading_style))
        score_data = [
            ['Dimension', 'Score', 'Weight'],
            ['Overall Quality Score', f"{score.get('overall', 'N/A')}/100", '100%'],
            ['Completeness (Missing Values)', f"{score.get('completeness', 'N/A')}/100", '25%'],
            ['Uniqueness (Duplicate Records)', f"{score.get('uniqueness', 'N/A')}/100", '20%'],
            ['Validity (Data Type & Range)', f"{score.get('validity', 'N/A')}/100", '25%'],
            ['Consistency (Format Integrity)', f"{score.get('consistency', 'N/A')}/100", '15%'],
            ['Anomaly Score (Isolation Forest)', f"{score.get('anomalyScore', 'N/A')}/100", '15%'],
        ]
        score_table = Table(score_data, colWidths=[8*cm, 4*cm, 3*cm])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366F1')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(score_table)
    
    story.append(Spacer(1, 1*cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E5E7EB')))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph(
        "DataForge · Final Year Project (23SW) · Department of Software Engineering, MUET Jamshoro",
        ParagraphStyle('Footer', parent=body_style, fontSize=8, textColor=colors.HexColor('#9CA3AF'), alignment=TA_CENTER)
    ))
    
    doc.build(story)
    return buffer.getvalue()
