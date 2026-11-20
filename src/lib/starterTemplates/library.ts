import { Template } from "../types";
import { DocBuilder } from "./builder";

export interface StarterTemplateDef {
  id: string;
  name: string;
  category: string;
  description: string;
  build: () => Template;
}

const RED = "#7a1f2b";
const NAVY = "#0f3d68";
const GREEN = "#0f5132";
const SLATE = "#1f2937";

const defs: StarterTemplateDef[] = [
  // ---------------------------------------------------------------- Statements
  {
    id: "savings-account-statement",
    name: "Savings Account Statement",
    category: "Statements",
    description: "Transaction history with running balance, opening/closing summary.",
    build: () =>
      new DocBuilder("Savings Account Statement", "Statement Period: {{PeriodStart}} to {{PeriodEnd}}")
        .kv([
          ["Account Title", "{{CustomerName}}"],
          ["Account Number", "{{AccountNumber}}"],
          ["Branch", "{{BranchName}}"],
          ["Currency", "{{Currency}}"],
          ["IBAN", "{{IBAN}}"],
          ["Statement Date", "{{Date}}"],
        ])
        .divider()
        .table(
          [
            { header: "Date", field: "date", width: 70, align: "left" },
            { header: "Description", field: "description", width: 200, align: "left" },
            { header: "Debit", field: "debit", width: 80, align: "right" },
            { header: "Credit", field: "credit", width: 80, align: "right" },
            { header: "Balance", field: "balance", width: 93, align: "right" },
          ],
          "{{Transactions}}",
          400
        )
        .kv([
          ["Opening Balance", "{{OpeningBalance}}"],
          ["Closing Balance", "{{ClosingBalance}}"],
        ])
        .build("Savings Account Statement"),
  },
  {
    id: "current-account-statement",
    name: "Current Account Statement",
    category: "Statements",
    description: "Same as the savings statement, tuned for current/checking accounts.",
    build: () =>
      new DocBuilder("Current Account Statement", "Statement Period: {{PeriodStart}} to {{PeriodEnd}}", NAVY)
        .kv([
          ["Account Title", "{{CustomerName}}"],
          ["Account Number", "{{AccountNumber}}"],
          ["Branch", "{{BranchName}}"],
          ["Currency", "{{Currency}}"],
          ["IBAN", "{{IBAN}}"],
          ["Overdraft Limit", "{{OverdraftLimit}}"],
        ])
        .divider()
        .table(
          [
            { header: "Date", field: "date", width: 70, align: "left" },
            { header: "Description", field: "description", width: 200, align: "left" },
            { header: "Debit", field: "debit", width: 80, align: "right" },
            { header: "Credit", field: "credit", width: 80, align: "right" },
            { header: "Balance", field: "balance", width: 93, align: "right" },
          ],
          "{{Transactions}}",
          400
        )
        .kv([
          ["Opening Balance", "{{OpeningBalance}}"],
          ["Closing Balance", "{{ClosingBalance}}"],
        ])
        .build("Current Account Statement"),
  },
  {
    id: "fixed-deposit-certificate",
    name: "Term Deposit Certificate",
    category: "Statements",
    description: "Fixed/term deposit placement certificate with maturity details.",
    build: () =>
      new DocBuilder("Term Deposit Certificate", "Certificate No: {{CertificateNo}}")
        .paragraph("This is to certify that a fixed/term deposit has been placed with {{BankName}} under the following terms:")
        .kv([
          ["Depositor Name", "{{CustomerName}}"],
          ["Account Number", "{{AccountNumber}}"],
          ["Deposit Amount", "{{DepositAmount}}"],
          ["Tenure", "{{Tenure}}"],
          ["Interest Rate", "{{InterestRate}}"],
          ["Maturity Date", "{{MaturityDate}}"],
          ["Maturity Value", "{{MaturityValue}}"],
          ["Placement Date", "{{Date}}"],
        ])
        .divider()
        .paragraph(
          "Upon maturity, the principal along with accrued interest will be credited to the account mentioned above, unless renewal instructions are received in writing."
        )
        .signatures()
        .build("Term Deposit Certificate"),
  },

  // ---------------------------------------------------------------- Account letters
  {
    id: "account-opening-confirmation",
    name: "Account Opening Confirmation",
    category: "Account Letters",
    description: "Welcome letter confirming a newly opened account's details.",
    build: () =>
      new DocBuilder("Account Opening Confirmation")
        .paragraph("Dear {{CustomerName}},")
        .paragraph(
          "We are pleased to confirm that your account has been successfully opened with {{BankName}}. Details of your account are provided below."
        )
        .kv([
          ["Account Title", "{{CustomerName}}"],
          ["Account Number", "{{AccountNumber}}"],
          ["Account Type", "{{AccountType}}"],
          ["Branch", "{{BranchName}}"],
          ["IBAN", "{{IBAN}}"],
          ["Opening Date", "{{Date}}"],
        ])
        .divider()
        .paragraph(
          "Please keep this letter for your records. For any assistance, contact our customer support at {{SupportPhone}} or visit your nearest branch."
        )
        .signatures("Authorized Signatory", "Branch Manager")
        .build("Account Opening Confirmation Letter"),
  },
  {
    id: "account-closure-confirmation",
    name: "Account Closure Confirmation",
    category: "Account Letters",
    description: "Confirms an account has been closed and any remaining balance settled.",
    build: () =>
      new DocBuilder("Account Closure Confirmation")
        .paragraph("Dear {{CustomerName}},")
        .paragraph("As per your request, we confirm that the following account has been closed effective {{ClosureDate}}.")
        .kv([
          ["Account Title", "{{CustomerName}}"],
          ["Account Number", "{{AccountNumber}}"],
          ["Branch", "{{BranchName}}"],
          ["Closure Date", "{{ClosureDate}}"],
          ["Final Balance Paid", "{{FinalBalance}}"],
          ["Payment Mode", "{{PaymentMode}}"],
        ])
        .divider()
        .paragraph("We appreciate the relationship and hope to serve you again in the future.")
        .signatures("Authorized Signatory", "Branch Manager")
        .build("Account Closure Confirmation Letter"),
  },
  {
    id: "balance-confirmation-certificate",
    name: "Balance Confirmation Certificate",
    category: "Account Letters",
    description: "Certifies an account balance as of a given date, for audits or visas.",
    build: () =>
      new DocBuilder("Balance Confirmation Certificate", "As of {{Date}}")
        .paragraph(
          "This is to certify that as per our records, the following account maintained with {{BankName}} reflects the balance stated below as of the close of business on {{Date}}."
        )
        .kv([
          ["Account Title", "{{CustomerName}}"],
          ["Account Number", "{{AccountNumber}}"],
          ["Account Type", "{{AccountType}}"],
          ["Currency", "{{Currency}}"],
          ["Balance", "{{Balance}}"],
          ["Branch", "{{BranchName}}"],
        ])
        .divider()
        .paragraph("This certificate is issued at the request of the customer for {{Purpose}} and is subject to verification by the bank.")
        .signatures()
        .build("Balance Confirmation Certificate"),
  },
  {
    id: "interest-certificate",
    name: "Interest Certificate",
    category: "Account Letters",
    description: "Annual interest-earned certificate for tax filing purposes.",
    build: () =>
      new DocBuilder("Certificate of Interest Earned", "Tax Year: {{TaxYear}}")
        .paragraph(
          "This is to certify that the following interest was earned on the account(s) held by {{CustomerName}} with {{BankName}} during the period {{PeriodStart}} to {{PeriodEnd}}."
        )
        .kv([
          ["Account Number", "{{AccountNumber}}"],
          ["Account Type", "{{AccountType}}"],
          ["Interest Earned", "{{InterestEarned}}"],
          ["Withholding Tax", "{{WithholdingTax}}"],
          ["Net Interest", "{{NetInterest}}"],
          ["CNIC / Tax ID", "{{TaxId}}"],
        ])
        .divider()
        .paragraph("This certificate is issued for tax filing purposes and may be submitted to the relevant tax authority as evidence of interest income.")
        .signatures()
        .build("Interest Certificate"),
  },

  // ---------------------------------------------------------------- Loans & cards
  {
    id: "loan-offer-letter",
    name: "Loan Offer Letter",
    category: "Loans & Cards",
    description: "Pre-approval / offer letter with tenure, markup, and instalment terms.",
    build: () =>
      new DocBuilder("Loan Offer Letter", "Offer Reference: {{OfferReference}}", RED)
        .paragraph("Dear {{CustomerName}},")
        .paragraph(
          "We are pleased to offer you a loan facility subject to the terms and conditions outlined below. This offer is valid until {{OfferValidTill}}."
        )
        .kv([
          ["Loan Type", "{{LoanType}}"],
          ["Loan Amount", "{{LoanAmount}}"],
          ["Tenure", "{{Tenure}}"],
          ["Interest Rate", "{{InterestRate}}"],
          ["Monthly Instalment", "{{MonthlyInstalment}}"],
          ["Processing Fee", "{{ProcessingFee}}"],
        ])
        .divider()
        .paragraph(
          "Please sign and return a copy of this letter to confirm your acceptance of the above terms. Disbursement will follow upon completion of documentation."
        )
        .signatures("Authorized Signatory", "Applicant Signature")
        .build("Loan Offer Letter", { watermark: "OFFER COPY" }),
  },
  {
    id: "loan-sanction-letter",
    name: "Loan Sanction Letter",
    category: "Loans & Cards",
    description: "Formal sanction advice issued after credit approval, before disbursement.",
    build: () =>
      new DocBuilder("Loan Sanction Letter", "Sanction Advice No: {{SanctionNo}}", RED)
        .paragraph("Dear {{CustomerName}},")
        .paragraph("We are pleased to inform you that your loan application has been sanctioned as per the details below.")
        .kv([
          ["Loan Type", "{{LoanType}}"],
          ["Sanctioned Amount", "{{LoanAmount}}"],
          ["Tenure", "{{Tenure}}"],
          ["Interest Rate", "{{InterestRate}}"],
          ["Security / Collateral", "{{Collateral}}"],
          ["Disbursement Mode", "{{DisbursementMode}}"],
        ])
        .divider()
        .paragraph("Disbursement is subject to completion of documentation, security perfection, and compliance with the bank's standard lending terms.")
        .signatures("Credit Officer", "Applicant Signature")
        .build("Loan Sanction Letter"),
  },
  {
    id: "credit-card-offer-letter",
    name: "Credit Card Offer Letter",
    category: "Loans & Cards",
    description: "Pre-approved credit card offer with limit, fees, and markup.",
    build: () =>
      new DocBuilder("Credit Card Offer Letter", "Pre-Approved Offer", RED)
        .paragraph("Dear {{CustomerName}},")
        .paragraph("Congratulations! Based on your relationship with {{BankName}}, you have been pre-approved for the following credit card.")
        .kv([
          ["Card Type", "{{CardType}}"],
          ["Credit Limit", "{{CreditLimit}}"],
          ["Annual Fee", "{{AnnualFee}}"],
          ["Markup Rate", "{{MarkupRate}}"],
          ["Offer Valid Till", "{{OfferValidTill}}"],
        ])
        .divider()
        .paragraph("To activate this offer, please complete the enclosed application form and submit it along with the required documents at your nearest branch.")
        .signatures("Authorized Signatory", "")
        .build("Credit Card Offer Letter"),
  },
  {
    id: "bank-guarantee-letter",
    name: "Bank Guarantee",
    category: "Loans & Cards",
    description: "Formal guarantee issued on behalf of a customer to a beneficiary.",
    build: () =>
      new DocBuilder("Bank Guarantee", "Guarantee No: {{GuaranteeNo}}", SLATE)
        .paragraph(
          "This Bank Guarantee is issued by {{BankName}} in favor of {{Beneficiary}} on behalf of our customer {{CustomerName}}, for the due performance of the obligations described below."
        )
        .kv([
          ["Guarantee Amount", "{{GuaranteeAmount}}"],
          ["Purpose", "{{Purpose}}"],
          ["Issue Date", "{{Date}}"],
          ["Expiry Date", "{{ExpiryDate}}"],
          ["Applicant", "{{CustomerName}}"],
          ["Beneficiary", "{{Beneficiary}}"],
        ])
        .divider()
        .paragraph("This guarantee is valid until the expiry date mentioned above and is subject to the bank's standard terms and conditions for guarantees.")
        .stampCircle("BANK SEAL", SLATE)
        .signatures()
        .build("Bank Guarantee Letter"),
  },

  // ---------------------------------------------------------------- HR letters
  {
    id: "employee-joining-letter",
    name: "Employee Joining Letter",
    category: "HR Letters",
    description: "Confirms a new employee's designation, department, and joining date.",
    build: () =>
      new DocBuilder("Employee Joining Letter")
        .paragraph("Dear {{EmployeeName}},")
        .paragraph(
          "We are pleased to confirm your joining with {{BankName}} as {{Designation}} in the {{Department}} department, effective {{JoiningDate}}."
        )
        .kv([
          ["Employee Name", "{{EmployeeName}}"],
          ["Employee ID", "{{EmployeeId}}"],
          ["Designation", "{{Designation}}"],
          ["Department", "{{Department}}"],
          ["Reporting Manager", "{{ReportingManager}}"],
          ["Joining Date", "{{JoiningDate}}"],
        ])
        .divider()
        .paragraph(
          "Please report to the HR department on your joining date with the original documents listed in the enclosed checklist. We look forward to having you on our team."
        )
        .signatures("HR Manager", "Employee Signature")
        .build("Employee Joining Letter"),
  },
  {
    id: "employee-experience-letter",
    name: "Employee Experience Letter",
    category: "HR Letters",
    description: "Relieving / experience letter issued when an employee leaves.",
    build: () =>
      new DocBuilder("Experience Letter", "To Whom It May Concern")
        .paragraph(
          "This is to certify that {{EmployeeName}} was employed with {{BankName}} as {{Designation}} in the {{Department}} department from {{JoiningDate}} to {{LastWorkingDate}}."
        )
        .kv([
          ["Employee ID", "{{EmployeeId}}"],
          ["Designation", "{{Designation}}"],
          ["Department", "{{Department}}"],
          ["Last Working Date", "{{LastWorkingDate}}"],
        ])
        .divider()
        .paragraph("During their tenure, {{EmployeeName}} was found to be sincere, hardworking, and professional. We wish them success in their future endeavors.")
        .signatures("HR Manager", "")
        .build("Employee Experience Letter"),
  },
  {
    id: "salary-certificate",
    name: "Salary Certificate",
    category: "HR Letters",
    description: "Confirms current employment and salary, commonly needed for loans/visas.",
    build: () =>
      new DocBuilder("Salary Certificate", "To Whom It May Concern")
        .paragraph(
          "This is to certify that {{EmployeeName}} is employed with {{BankName}} as {{Designation}} since {{JoiningDate}}. Their current salary details are as follows:"
        )
        .kv([
          ["Employee ID", "{{EmployeeId}}"],
          ["Designation", "{{Designation}}"],
          ["Gross Monthly Salary", "{{GrossSalary}}"],
          ["Net Monthly Salary", "{{NetSalary}}"],
          ["Department", "{{Department}}"],
          ["Issue Date", "{{Date}}"],
        ])
        .divider()
        .paragraph("This certificate is issued upon the employee's request for {{Purpose}} and does not constitute an employment guarantee.")
        .signatures("HR Manager", "")
        .build("Salary Certificate"),
  },
  {
    id: "noc-letter",
    name: "No Objection Certificate",
    category: "HR Letters",
    description: "General-purpose NOC for customer or employee requests.",
    build: () =>
      new DocBuilder("No Objection Certificate")
        .paragraph(
          "This is to certify that {{BankName}} has no objection to {{CustomerName}} ({{IdentificationType}}: {{IdentificationNumber}}) proceeding with the matter described below."
        )
        .kv([
          ["Purpose", "{{Purpose}}"],
          ["Reference Number", "{{ReferenceNumber}}"],
          ["Account Number", "{{AccountNumber}}"],
          ["Issue Date", "{{Date}}"],
        ])
        .divider()
        .paragraph("This certificate is issued without prejudice and does not constitute any financial liability on the part of {{BankName}}.")
        .signatures()
        .build("No Objection Certificate (NOC)"),
  },

  // ---------------------------------------------------------------- Vouchers
  {
    id: "cash-deposit-voucher",
    name: "Cash Deposit Voucher",
    category: "Vouchers",
    description: "Teller deposit slip with denomination breakdown.",
    build: () =>
      new DocBuilder("Cash Deposit Voucher", "Transaction Receipt", GREEN)
        .kv([
          ["Voucher No", "{{VoucherNo}}"],
          ["Date", "{{Date}}"],
          ["Depositor Name", "{{DepositorName}}"],
          ["Account Number", "{{AccountNumber}}"],
          ["Branch", "{{BranchName}}"],
          ["Amount in Words", "{{AmountInWords}}"],
        ])
        .divider()
        .table(
          [
            { header: "Denomination", field: "denomination", width: 150, align: "left" },
            { header: "Count", field: "count", width: 120, align: "center" },
            { header: "Amount", field: "amount", width: 253, align: "right" },
          ],
          "{{Denominations}}",
          120
        )
        .kv([["Total Amount", "{{TotalAmount}}"]])
        .signatures("Teller Signature", "Depositor Signature")
        .build("Cash Deposit Voucher"),
  },
  {
    id: "cash-withdrawal-voucher",
    name: "Cash Withdrawal Voucher",
    category: "Vouchers",
    description: "Teller withdrawal slip with payee and disbursement details.",
    build: () =>
      new DocBuilder("Cash Withdrawal Voucher", "Transaction Receipt", GREEN)
        .kv([
          ["Voucher No", "{{VoucherNo}}"],
          ["Date", "{{Date}}"],
          ["Payee Name", "{{PayeeName}}"],
          ["Account Number", "{{AccountNumber}}"],
          ["Branch", "{{BranchName}}"],
          ["Amount in Words", "{{AmountInWords}}"],
        ])
        .divider()
        .kv([
          ["Amount Withdrawn", "{{Amount}}"],
          ["Balance After Withdrawal", "{{BalanceAfter}}"],
        ])
        .signatures("Teller Signature", "Payee Signature")
        .build("Cash Withdrawal Voucher"),
  },
  {
    id: "demand-draft-advice",
    name: "Demand Draft / Pay Order Advice",
    category: "Vouchers",
    description: "Issuance confirmation for a demand draft or pay order instrument.",
    build: () =>
      new DocBuilder("Demand Draft / Pay Order Advice", "Instrument Issuance Confirmation")
        .kv([
          ["Instrument No", "{{InstrumentNo}}"],
          ["Instrument Type", "{{InstrumentType}}"],
          ["Date of Issue", "{{Date}}"],
          ["Applicant", "{{CustomerName}}"],
          ["Payee Name", "{{PayeeName}}"],
          ["Amount", "{{Amount}}"],
          ["Amount in Words", "{{AmountInWords}}"],
          ["Payable At", "{{PayableAt}}"],
        ])
        .divider()
        .barcode("{{InstrumentNo}}")
        .signatures("Authorized Signatory", "")
        .build("Demand Draft / Pay Order Advice"),
  },
  {
    id: "cheque-book-issuance-advice",
    name: "Cheque Book Issuance Advice",
    category: "Vouchers",
    description: "Confirms a new cheque book has been issued against an account.",
    build: () =>
      new DocBuilder("Cheque Book Issuance Advice")
        .paragraph("Dear {{CustomerName}},")
        .paragraph("We confirm that a new cheque book has been issued against your account as per the details below.")
        .kv([
          ["Account Number", "{{AccountNumber}}"],
          ["Cheque Book Series", "{{ChequeSeries}}"],
          ["Number of Leaves", "{{LeafCount}}"],
          ["Issue Date", "{{Date}}"],
          ["Branch", "{{BranchName}}"],
          ["Delivery Mode", "{{DeliveryMode}}"],
        ])
        .divider()
        .paragraph(
          "Please verify the cheque book upon receipt and report any discrepancy to the branch immediately. Keep your cheque book in a safe place at all times."
        )
        .signatures()
        .build("Cheque Book Issuance Advice"),
  },

  // ---------------------------------------------------------------- Transactions
  {
    id: "ibft-transaction-receipt",
    name: "IBFT Transaction Receipt",
    category: "Transactions",
    description: "Interbank Fund Transfer confirmation with sender/beneficiary details.",
    build: () =>
      new DocBuilder("IBFT Transaction Receipt", "Interbank Fund Transfer")
        .kv([
          ["Transaction Ref", "{{TransactionRef}}"],
          ["Date & Time", "{{DateTime}}"],
          ["Sender Account", "{{SenderAccount}}"],
          ["Sender Bank", "{{BankName}}"],
          ["Beneficiary Name", "{{BeneficiaryName}}"],
          ["Beneficiary Bank", "{{BeneficiaryBank}}"],
          ["Beneficiary IBAN", "{{BeneficiaryIBAN}}"],
          ["Amount", "{{Amount}}"],
          ["Transaction Fee", "{{Fee}}"],
          ["Status", "{{Status}}"],
        ])
        .divider()
        .qr("{{TransactionRef}}", 84, "Scan to verify this transaction on our mobile app or website.")
        .build("IBFT Transaction Receipt"),
  },
  {
    id: "rtgs-transaction-advice",
    name: "RTGS Transaction Advice",
    category: "Transactions",
    description: "Real-time gross settlement advice for large-value transfers.",
    build: () =>
      new DocBuilder("RTGS Transaction Advice", "Real-Time Gross Settlement")
        .kv([
          ["UTR / Transaction Ref", "{{TransactionRef}}"],
          ["Date & Time", "{{DateTime}}"],
          ["Remitting Account", "{{SenderAccount}}"],
          ["Beneficiary Name", "{{BeneficiaryName}}"],
          ["Beneficiary Bank", "{{BeneficiaryBank}}"],
          ["Beneficiary Account", "{{BeneficiaryIBAN}}"],
          ["Amount", "{{Amount}}"],
          ["Settlement Status", "{{Status}}"],
        ])
        .divider()
        .paragraph("This advice confirms settlement instruction submission. Actual credit to the beneficiary account is subject to the receiving bank's processing time.")
        .build("RTGS Transaction Advice"),
  },
  {
    id: "inward-clearing-advice",
    name: "Inward Clearing Advice",
    category: "Transactions",
    description: "Cheques received via inward clearing and processed against the account.",
    build: () =>
      new DocBuilder("Inward Clearing Advice", "Cheque Clearing Notification")
        .paragraph("This is to advise that the following cheque(s) received through inward clearing have been processed against your account.")
        .table(
          [
            { header: "Cheque No", field: "chequeNo", width: 100, align: "left" },
            { header: "Drawee Bank", field: "draweeBank", width: 150, align: "left" },
            { header: "Amount", field: "amount", width: 120, align: "right" },
            { header: "Status", field: "status", width: 153, align: "center" },
          ],
          "{{ClearingCheques}}",
          160
        )
        .kv([
          ["Account Number", "{{AccountNumber}}"],
          ["Clearing Date", "{{Date}}"],
          ["Clearing House", "{{ClearingHouse}}"],
          ["Total Amount", "{{TotalAmount}}"],
        ])
        .build("Inward Clearing Advice"),
  },
  {
    id: "outward-clearing-advice",
    name: "Outward Clearing Advice",
    category: "Transactions",
    description: "Cheques deposited by the customer and sent out for clearing.",
    build: () =>
      new DocBuilder("Outward Clearing Advice", "Cheque Clearing Notification")
        .paragraph("This is to advise that the following cheque(s) deposited by you have been sent for outward clearing.")
        .table(
          [
            { header: "Cheque No", field: "chequeNo", width: 100, align: "left" },
            { header: "Presented To", field: "presentedTo", width: 150, align: "left" },
            { header: "Amount", field: "amount", width: 120, align: "right" },
            { header: "Status", field: "status", width: 153, align: "center" },
          ],
          "{{ClearingCheques}}",
          160
        )
        .kv([
          ["Account Number", "{{AccountNumber}}"],
          ["Clearing Date", "{{Date}}"],
          ["Clearing House", "{{ClearingHouse}}"],
          ["Total Amount", "{{TotalAmount}}"],
        ])
        .build("Outward Clearing Advice"),
  },
  {
    id: "standing-instruction-confirmation",
    name: "Standing Instruction Confirmation",
    category: "Transactions",
    description: "Confirms a recurring standing instruction registered on an account.",
    build: () =>
      new DocBuilder("Standing Instruction Confirmation")
        .paragraph("Dear {{CustomerName}},")
        .paragraph("We confirm that a standing instruction has been registered on your account as per the details below.")
        .kv([
          ["Instruction Reference", "{{InstructionRef}}"],
          ["Debit Account", "{{DebitAccount}}"],
          ["Beneficiary Account", "{{BeneficiaryAccount}}"],
          ["Amount", "{{Amount}}"],
          ["Frequency", "{{Frequency}}"],
          ["Start Date", "{{StartDate}}"],
          ["End Date", "{{EndDate}}"],
        ])
        .divider()
        .paragraph("The standing instruction will remain active until the end date mentioned above or until cancelled by the customer in writing.")
        .signatures()
        .build("Standing Instruction Confirmation"),
  },

  // ---------------------------------------------------------------- Digital onboarding
  {
    id: "qr-account-opening-certificate",
    name: "QR Code Account Opening Certificate",
    category: "Digital Onboarding",
    description: "Digital onboarding confirmation with a scannable verification QR code.",
    build: () =>
      new DocBuilder("Digital Account Opening Certificate", "QR-Verified Account")
        .paragraph(
          "This certifies that a digital account has been opened via {{BankName}}'s QR-based onboarding channel. Scan the QR code below to verify account authenticity."
        )
        .kv([
          ["Account Title", "{{CustomerName}}"],
          ["Account Number", "{{AccountNumber}}"],
          ["IBAN", "{{IBAN}}"],
          ["Onboarding Channel", "{{Channel}}"],
          ["CNIC / ID Number", "{{IdentificationNumber}}"],
          ["Opening Date", "{{Date}}"],
        ])
        .divider()
        .qr("{{AccountVerificationURL}}", 100, "Scan this QR code with the {{BankName}} mobile app to verify this account was opened digitally and view live status.")
        .build("QR Code Based Account Opening Certificate"),
  },
];

export const STARTER_TEMPLATES: StarterTemplateDef[] = defs;

export const STARTER_TEMPLATE_CATEGORIES: string[] = Array.from(new Set(defs.map((d) => d.category)));
