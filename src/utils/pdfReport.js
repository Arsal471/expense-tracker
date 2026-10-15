import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { formatDate, formatMoney, formatMonth, today, getBalances, getLoanPeople } from "./helpers";

// 🎨 Colours as [r, g, b] (jsPDF doesn't understand Tailwind classes)
const INDIGO = [79, 70, 229];
const SLATE_900 = [15, 23, 42];
const SLATE_500 = [100, 116, 139];
const SLATE_100 = [241, 245, 249];
const ROSE = [225, 29, 72];

const MARGIN = 14; // mm

const EMERALD = [5, 150, 105];
const SKY = [2, 132, 199];
const AMBER = [217, 119, 6];

// how each loan type is described in the table
const LOAN_WORDS = { borrow: "borrowed", lend: "lent", repay: "you repaid", collect: "repaid you" };

// 🧾 Builds the PDF and returns the jsPDF document (no download yet)
export function buildReport({ expenses, typeFilter = "all", categoryFilter, monthFilter, userName, email }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ---------- 1. Header band ----------
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, pageWidth, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Budget Report", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated on ${formatDate(today())}`, MARGIN, 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(userName || "", pageWidth - MARGIN, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(email || "", pageWidth - MARGIN, 24, { align: "right" });

  // ---------- 2. Which filter was used ----------
  const period = monthFilter ? formatMonth(monthFilter) : "All time";
  const typeLabel = {
    all: "Everything",
    income: "Income only",
    expense: "Expenses only",
    savings: "Savings only",
    loans: "Loans only",
  }[typeFilter];
  const category = categoryFilter === "All" ? "All categories" : categoryFilter;

  doc.setTextColor(...SLATE_500);
  doc.setFontSize(10);
  doc.text(`Period: ${period}     Showing: ${typeLabel}     Category: ${category}`, MARGIN, 44);

  // ---------- 3. Summary boxes ----------
  const balances = getBalances(expenses);
  const { income, expense: spent, savings: saved } = balances;
  const net = income - spent;
  const hasLoans = expenses.some((e) => LOAN_WORDS[e.type]);

  const boxes = [
    { label: "INCOME", value: formatMoney(income), color: EMERALD },
    { label: "EXPENSES", value: formatMoney(spent), color: ROSE },
    { label: "SAVED", value: formatMoney(saved), color: SKY },
    { label: "NET (IN - OUT)", value: (net > 0 ? "+" : "") + formatMoney(net), color: net >= 0 ? EMERALD : ROSE },
  ];
  const gap = 4;
  const boxWidth = (pageWidth - MARGIN * 2 - gap * (boxes.length - 1)) / boxes.length;
  const boxY = 50;

  boxes.forEach((box, i) => {
    const x = MARGIN + i * (boxWidth + gap);
    doc.setFillColor(...SLATE_100);
    doc.roundedRect(x, boxY, boxWidth, 20, 2, 2, "F");

    doc.setTextColor(...SLATE_500);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(box.label, x + 4, boxY + 7);

    doc.setTextColor(...box.color);
    doc.setFontSize(12);
    doc.text(box.value, x + 4, boxY + 15);
  });

  // ---------- 4. Breakdown tables (only for types that have entries) ----------
  let y = 82;
  const sections = [
    { type: "expense", title: "Spending by category", color: ROSE },
    { type: "income", title: "Income by source", color: EMERALD },
    { type: "saving", title: "Saved by pot", color: SKY },
  ];
  sections.forEach((section) => {
    const rows = expenses.filter((e) => e.type === section.type);
    if (rows.length === 0) return;
    y = breakdownTable(doc, rows, section.title, section.color, y);
  });

  // ---------- 4b. Loans: balance with each person ----------
  if (hasLoans) {
    const people = getLoanPeople(expenses);
    heading(doc, "Loans", y);
    autoTable(doc, {
      startY: y + 4,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Person", "Status", "Amount"]],
      body: people.map((p) => [
        p.name,
        p.net > 0 ? "Owes you" : p.net < 0 ? "You owe" : "Settled",
        formatMoney(Math.abs(p.net)),
      ]),
      foot: [
        ["", "You owe (total)", formatMoney(balances.youOwe)],
        ["", "Owed to you (total)", formatMoney(balances.owedToYou)],
      ],
      theme: "plain",
      headStyles: { fillColor: SLATE_100, textColor: SLATE_500, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { textColor: SLATE_900, fontSize: 10 },
      footStyles: { textColor: SLATE_900, fontStyle: "bold", fontSize: 9 },
      columnStyles: { 2: { halign: "right", cellWidth: 40 } },
      didParseCell: (data) => {
        if (data.column.index === 2) data.cell.styles.halign = "right";
        if (data.section === "body" && data.column.index === 1) {
          const n = people[data.row.index].net;
          data.cell.styles.textColor = n > 0 ? EMERALD : n < 0 ? ROSE : SLATE_500;
        }
        if (data.section === "foot" && data.column.index === 2) {
          data.cell.styles.textColor = data.row.index === 0 ? ROSE : EMERALD;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  // ---------- 5. All entries ----------
  heading(doc, "All entries", y);

  autoTable(doc, {
    startY: y + 4,
    margin: { left: MARGIN, right: MARGIN, bottom: 18 },
    head: [["#", "Date", "Title", "Category", "Amount"]],
    body: expenses.map((e, i) => [
      i + 1,
      formatDate(e.date),
      e.title,
      // savings and loan entries say which way the money moved
      e.type === "saving"
        ? `${e.category} (saved)`
        : e.type === "withdrawal"
          ? `${e.category} (withdrawn)`
          : LOAN_WORDS[e.type]
            ? `${e.category} (${LOAN_WORDS[e.type]})`
            : e.category,
      (["income", "borrow", "collect"].includes(e.type) ? "+ " : ["expense", "lend", "repay"].includes(e.type) ? "- " : "") +
        formatMoney(e.amount),
    ]),
    foot: [
      ["", "", "", "Total income", formatMoney(income)],
      ["", "", "", "Total expenses", formatMoney(spent)],
      ["", "", "", "Saved (net)", formatMoney(saved)],
      ["", "", "", "Net (in - out)", (net > 0 ? "+" : "") + formatMoney(net)],
    ],
    theme: "striped",
    showFoot: "lastPage", // totals only once, at the very end
    headStyles: { fillColor: INDIGO, textColor: 255, fontSize: 9 },
    footStyles: { fillColor: SLATE_100, textColor: SLATE_900, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { textColor: SLATE_900, fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, textColor: SLATE_500 },
      1: { cellWidth: 28 },
      3: { cellWidth: 32 },
      4: { halign: "right", cellWidth: 32 },
    },
    didParseCell: (data) => {
      if (data.column.index !== 4) return;
      data.cell.styles.halign = "right";
      // colour the amount: green = income, red = expense, blue = savings
      const colors = {
        income: EMERALD,
        expense: ROSE,
        saving: SKY,
        withdrawal: SKY,
        borrow: AMBER,
        lend: AMBER,
        repay: AMBER,
        collect: AMBER,
      };
      if (data.section === "body") {
        data.cell.styles.textColor = colors[expenses[data.row.index].type];
      }
      if (data.section === "foot") {
        data.cell.styles.textColor = [EMERALD, ROSE, SKY, net >= 0 ? EMERALD : ROSE][data.row.index];
      }
    },
  });

  // ---------- 6. Footer on every page ----------
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...SLATE_100);
    doc.line(MARGIN, pageHeight - 12, pageWidth - MARGIN, pageHeight - 12);
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_500);
    doc.text("Budget Tracker", MARGIN, pageHeight - 7);
    doc.text(`Page ${i} of ${pages}`, pageWidth - MARGIN, pageHeight - 7, { align: "right" });
  }

  return doc;
}

// 📊 One "by category" table with a little bar per row. Returns the Y position after it.
function breakdownTable(doc, rows, title, barColor, y) {
  const total = rows.reduce((sum, e) => sum + e.amount, 0);

  // group with reduce: { Food: { count, amount }, Gym: { ... } } — works for custom names too
  const groups = rows.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = { count: 0, amount: 0 };
    acc[e.category].count += 1;
    acc[e.category].amount += e.amount;
    return acc;
  }, {});
  const list = Object.entries(groups)
    .map(([name, g]) => ({ name, ...g }))
    .sort((a, b) => b.amount - a.amount);

  heading(doc, title, y);

  autoTable(doc, {
    startY: y + 4,
    margin: { left: MARGIN, right: MARGIN },
    head: [[title.includes("source") ? "Source" : title.includes("pot") ? "Pot" : "Category", "Entries", "Amount", "Share"]],
    body: list.map((c) => [
      c.name,
      c.count,
      formatMoney(c.amount),
      total ? Math.round((c.amount / total) * 100) + "%" : "0%",
    ]),
    theme: "plain",
    headStyles: { fillColor: SLATE_100, textColor: SLATE_500, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { textColor: SLATE_900, fontSize: 10 },
    columnStyles: {
      1: { halign: "center", cellWidth: 25 },
      2: { halign: "right", cellWidth: 35 },
      3: { cellWidth: 60 },
    },
    didParseCell: (data) => {
      if (data.section === "head" && data.column.index === 1) data.cell.styles.halign = "center";
      if (data.section === "head" && data.column.index === 2) data.cell.styles.halign = "right";
    },
    // draw a small bar in the "Share" column
    didDrawCell: (data) => {
      if (data.section !== "body" || data.column.index !== 3) return;
      const share = total ? list[data.row.index].amount / total : 0;
      const barX = data.cell.x + 14;
      const barY = data.cell.y + data.cell.height / 2 - 1.5;
      const barW = data.cell.width - 18;
      doc.setFillColor(...SLATE_100);
      doc.roundedRect(barX, barY, barW, 3, 1.5, 1.5, "F");
      if (share > 0) {
        doc.setFillColor(...barColor);
        doc.roundedRect(barX, barY, Math.max(barW * share, 3), 3, 1.5, 1.5, "F");
      }
    },
  });

  return doc.lastAutoTable.finalY + 12;
}

function heading(doc, text, y) {
  doc.setTextColor(...SLATE_900);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(text, MARGIN, y);
}

// ⬇️ Builds the PDF and downloads it, e.g. "budget-report-2026-10-income-salary.pdf"
export function downloadReport(options) {
  const doc = buildReport(options);
  const parts = ["budget-report", options.monthFilter || "all-time"];
  if (options.typeFilter && options.typeFilter !== "all") parts.push(options.typeFilter);
  if (options.categoryFilter !== "All") parts.push(options.categoryFilter.toLowerCase());
  doc.save(parts.join("-") + ".pdf");
}
