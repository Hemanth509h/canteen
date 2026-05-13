import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const fixOklchColors = (clonedDoc) => {
  const elements = clonedDoc.getElementsByTagName("*");
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    ["color", "backgroundColor", "borderColor"].forEach((prop) => {
      const val = el.style[prop] || window.getComputedStyle(el)[prop];
      if (val && val.includes("oklch")) {
        if (prop === "backgroundColor") el.style[prop] = "#ffffff";
        else if (prop === "color") el.style[prop] = "#000000";
        else el.style[prop] = "#cccccc";
      }
    });
  }
};

async function captureCanvas(element) {
  return html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    onclone: fixOklchColors,
  });
}

export async function printElement(element) {
  if (!element) return;
  try {
    const canvas = await captureCanvas(element);
    const imgData = canvas.toDataURL("image/png");

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Print Preview</title>
    <style>
      @page { size: A4 portrait; margin: 12mm 15mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #fff; }
      img { width: 100%; height: auto; display: block; }
    </style>
  </head>
  <body>
    <img src="${imgData}" />
  </body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 400);
  } catch (err) {
    console.error("Print failed:", err);
  }
}

export async function generatePDF(element, { margin = 10 } = {}) {
  if (!element) return null;
  try {
    const canvas = await captureCanvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;
    const contentH = pageH - margin * 2;

    let page = 0;
    while (page * contentH < imgH) {
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, margin - page * contentH, imgW, imgH);
      page++;
    }

    return pdf;
  } catch (err) {
    console.error("PDF generation failed:", err);
    return null;
  }
}

export async function downloadPDF(element, filename = "document.pdf", options = {}) {
  const pdf = await generatePDF(element, options);
  if (pdf) pdf.save(filename);
}
