import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StatementSummary } from '@/lib/calculations/statement';
import { formatRupiah, formatTanggal } from '@/lib/utils/formatters';

export function exportStatementToPdf(
  summary: StatementSummary,
  userName: string = 'Budi Santoso',
  userEmail: string = 'budi.santoso@example.com'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Header & Kop Laporan
  // Background Header Accent Bar
  doc.setFillColor(24, 24, 27); // zinc-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Amber decorative line
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  // Brand text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('DompetKu', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(212, 212, 216); // zinc-300
  doc.text('Aplikasi Pelacak & Buku Kas Keuangan Pribadi', margin, 18);

  // Title on right side of header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(245, 158, 11); // amber-500
  doc.text('REKENING KORAN', pageWidth - margin, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(161, 161, 170); // zinc-400
  doc.text('STATEMENT OF ACCOUNT', pageWidth - margin, 17, { align: 'right' });

  // 2. Info Nasabah & Rekening (2 Kolom)
  let y = 33;

  doc.setDrawColor(228, 228, 231); // zinc-200
  doc.setFillColor(250, 250, 250); // zinc-50
  doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 2, 2, 'FD');

  const col1X = margin + 5;
  const col2X = margin + (pageWidth - margin * 2) / 2 + 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122); // zinc-500
  doc.text('INFORMASI NASABAH', col1X, y + 6);
  doc.text('INFORMASI REKENING', col2X, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(24, 24, 27); // zinc-900

  // Kolom 1: Nasabah
  doc.text(`Nama Pemilik  : `, col1X, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(userName, col1X + 23, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(`Email              : ${userEmail}`, col1X, y + 17);
  doc.text(`Tgl. Cetak       : ${formatTanggal(new Date(), { withTime: true })}`, col1X, y + 22);

  // Kolom 2: Rekening
  doc.text(`Rekening   : `, col2X, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(summary.accountName, col2X + 18, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(`Tipe Akun  : ${summary.accountType}`, col2X, y + 17);
  doc.text(`Periode      : `, col2X, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${summary.startDate} s.d. ${summary.endDate}`, col2X + 18, y + 22);

  // 3. Ringkasan Saldo (4 Kolom Kotak)
  y = 64;

  const boxWidth = (pageWidth - margin * 2 - 9) / 4;
  const boxHeight = 16;

  const summaryBoxes = [
    { label: 'SALDO AWAL', val: formatRupiah(summary.openingBalance), color: [71, 85, 105] }, // slate-600
    { label: `TOTAL KREDIT (${summary.creditCount})`, val: `+${formatRupiah(summary.totalCredit)}`, color: [16, 185, 129] }, // emerald-500
    { label: `TOTAL DEBIT (${summary.debitCount})`, val: `-${formatRupiah(summary.totalDebit)}`, color: [225, 29, 72] }, // rose-600
    { label: 'SALDO AKHIR', val: formatRupiah(summary.closingBalance), color: [217, 119, 6] }, // amber-600
  ];

  summaryBoxes.forEach((b, i) => {
    const bX = margin + i * (boxWidth + 3);
    doc.setDrawColor(228, 228, 231);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(bX, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(113, 113, 122);
    doc.text(b.label, bX + 3, y + 5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.text(b.val, bX + 3, y + 11.5);
  });

  // 4. Tabel Mutasi Rekening Lengkap
  y = 85;

  const tableRows = summary.items.map((item, index) => {
    return [
      String(index + 1),
      item.date,
      item.description,
      item.categoryName,
      item.debit > 0 ? formatRupiah(item.debit) : '-',
      item.credit > 0 ? formatRupiah(item.credit) : '-',
      formatRupiah(item.balance),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['No', 'Tanggal', 'Keterangan Transaksi', 'Kategori', 'Debit (Keluar)', 'Kredit (Masuk)', 'Saldo Berjalan']],
    body: tableRows.length > 0 ? tableRows : [['-', '-', 'Tidak ada mutasi transaksi pada periode ini', '-', '-', '-', formatRupiah(summary.openingBalance)]],
    theme: 'striped',
    margin: { left: margin, right: margin, bottom: 20 },
    headStyles: {
      fillColor: [24, 24, 27], // zinc-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [39, 39, 42],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 26 },
      4: { cellWidth: 26, halign: 'right', textColor: [225, 29, 72] }, // red debit
      5: { cellWidth: 26, halign: 'right', textColor: [5, 150, 105] }, // green credit
      6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // 5. Add footer to every page after table layout is computed
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Official note
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(161, 161, 170);
    doc.text(
      'Dokumen ini dicetak otomatis oleh DompetKu dan merupakan catatan keuangan resmi pengguna.',
      margin,
      pageHeight - 7
    );

    // Page numbering: Halaman X dari Y
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, pageHeight - 7, {
      align: 'right',
    });
  }

  // Save the PDF file to user browser
  const sanitizedAcc = summary.accountName.replace(/[^a-zA-Z0-9]/g, '-');
  const filename = `Rekening-Koran-${sanitizedAcc}-${summary.startDate}-sd-${summary.endDate}.pdf`;
  doc.save(filename);
}
