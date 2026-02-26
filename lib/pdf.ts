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
  const imgHeight = (canvas.height * maxWidth) / canvas.width;

  if (imgHeight <= pageHeight - margin * 2) {
    pdf.addImage(imgData, "PNG", margin, margin, maxWidth, imgHeight);
  } else {
    let currentHeight = 0;
    const sourcePageHeight = (canvas.width * (pageHeight - margin * 2)) / maxWidth;

    while (currentHeight < canvas.height) {
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(sourcePageHeight, canvas.height - currentHeight);
      const ctx = pageCanvas.getContext("2d");
      if (!ctx) break;

      ctx.drawImage(
        canvas,
        0,
        currentHeight,
        canvas.width,
        pageCanvas.height,
        0,
        0,
        canvas.width,
        pageCanvas.height
      );

      const pageImgData = pageCanvas.toDataURL("image/png");
      const pageImgHeight = (pageCanvas.height * maxWidth) / pageCanvas.width;

      if (currentHeight > 0) pdf.addPage();
      pdf.addImage(pageImgData, "PNG", margin, margin, maxWidth, pageImgHeight);
      currentHeight += pageCanvas.height;
    }
  }

  pdf.save(filename);
}
