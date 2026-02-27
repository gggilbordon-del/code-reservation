export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;
  const widthRatio = maxWidth / canvas.width;
  const heightRatio = maxHeight / canvas.height;
  const scaleRatio = Math.min(widthRatio, heightRatio);

  // Always fit full coupon on a single PDF page.
  const renderWidth = canvas.width * scaleRatio;
  const renderHeight = canvas.height * scaleRatio;
  const offsetX = (pageWidth - renderWidth) / 2;
  const offsetY = (pageHeight - renderHeight) / 2;

  pdf.addImage(imgData, "PNG", offsetX, offsetY, renderWidth, renderHeight);

  pdf.save(filename);
}
