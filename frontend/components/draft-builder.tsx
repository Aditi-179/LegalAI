"use client";

import { FormEvent, useState, useTransition, useEffect } from "react";
import { generateDraft } from "@/lib/api";

type DraftType = "RTI Application" | "ITR Notice Reply" | "Rent Agreement" | "Condonation of Delay" | "General Affidavit";

export function DraftBuilder() {
  const [step, setStep] = useState(1);
  const [draftType, setDraftType] = useState<DraftType>("RTI Application");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedResult, setEditedResult] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSelection = (type: DraftType) => {
    setDraftType(type);
    setStep(2);
  };

  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    setError("");
    
    startTransition(async () => {
      try {
        const payload = {
          title: `Draft: ${draftType}`,
          draft_type: draftType,
          ...inputs
        };
        const data = await generateDraft(payload);
        setResult(data.content);
        setEditedResult(data.content);
        setIsEditing(false);
        setStep(3);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate draft.");
      }
    });
  };

  const downloadAsDoc = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
            "xmlns:w='urn:schemas-microsoft-com:office:word' "+
            "xmlns='http://www.w3.org/TR/REC-html40'>"+
            "<head><meta charset='utf-8'><title>Legal Draft</title><style>"+
            "body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; text-align: justify; padding: 1in; }"+
            "</style></head><body>";
    const footer = "</body></html>";
    const content = isEditing ? editedResult : result;
    const sourceHTML = header + content.replace(/\n/g, '<br>') + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileLink = document.createElement("a");
    document.body.appendChild(fileLink);
    fileLink.href = source;
    fileLink.download = `${draftType.replace(/ /g, '_')}_Draft.doc`;
    fileLink.click();
    document.body.removeChild(fileLink);
  };

  const getFields = () => {
    if (draftType === "RTI Application") {
      return [
        { id: "APPLICANT_NAME", label: "Full Name", placeholder: "e.g. Aditi Sharma" },
        { id: "APPLICANT_ADDRESS", label: "Full Address", placeholder: "House No, Street, City..." },
        { id: "DEPARTMENT_NAME", label: "Department Name", placeholder: "e.g. Municipal Corporation of Delhi" },
        { id: "DEPARTMENT_ADDRESS", label: "Department Address", placeholder: "Exact address of the PIO office" },
        { id: "RTI_QUESTIONS", label: "Information Requested", placeholder: "List your questions here...", type: "textarea" },
        { id: "TIME_PERIOD", label: "Period of Information", placeholder: "e.g. April 2023 to March 2024" },
        { id: "FEE_INFO", label: "Fee Details", placeholder: "e.g. Postal Order No. 12345 dated 01/01/2024" },
      ];
    }
    if (draftType === "ITR Notice Reply") {
      return [
        { id: "TAXPAYER_NAME", label: "Taxpayer Name", placeholder: "As per PAN card" },
        { id: "TAXPAYER_ADDRESS", label: "Current Address", placeholder: "" },
        { id: "PAN_NUMBER", label: "PAN Number", placeholder: "ABCDE1234F" },
        { id: "MOBILE_NUMBER", label: "Mobile Number", placeholder: "" },
        { id: "WARD_OR_CIRCLE_NUMBER", label: "Ward / Circle Number", placeholder: "e.g. 1(1)(1)" },
        { id: "CITY", label: "City", placeholder: "" },
        { id: "ASSESSMENT_YEAR", label: "Assessment Year", placeholder: "e.g. 2024-25" },
        { id: "SECTION_OF_NOTICE", label: "Section of Notice", placeholder: "e.g. 143(1)" },
        { id: "NOTICE_REF", label: "Notice DIN / Ref No.", placeholder: "" },
        { id: "DATE_OF_NOTICE", label: "Date of Notice", placeholder: "DD/MM/YYYY" },
        { id: "DATE_OF_FILING_ITR", label: "Date of ITR Filing", placeholder: "DD/MM/YYYY" },
        { id: "ITR_ACK_NUMBER", label: "ITR Ack. Number", placeholder: "15-digit number" },
        { id: "ISSUE_DESCRIPTION", label: "Brief Issue Description", placeholder: "e.g. Mismatch in TDS", type: "textarea" },
        { id: "FACTUAL_DEFENSE", label: "Your Factual Defense", placeholder: "Explain your point clearly...", type: "textarea" },
      ];
    }
    if (draftType === "Rent Agreement") {
      return [
        { id: "LANDLORD_NAME", label: "Landlord Full Name", placeholder: "" },
        { id: "LANDLORD_PARENT_NAME", label: "Landlord's Father/Husband Name", placeholder: "" },
        { id: "LANDLORD_ADDRESS", label: "Landlord's Address", placeholder: "" },
        { id: "TENANT_NAME", label: "Tenant Full Name", placeholder: "" },
        { id: "TENANT_PARENT_NAME", label: "Tenant's Father/Husband Name", placeholder: "" },
        { id: "TENANT_ADDRESS", label: "Tenant's Permanent Address", placeholder: "" },
        { id: "RENTAL_PROPERTY_ADDRESS", label: "Rental Property Address", placeholder: "The property being rented", type: "textarea" },
        { id: "MONTHLY_RENT_AMOUNT", label: "Monthly Rent (Rs.)", placeholder: "e.g. 15000" },
        { id: "SECURITY_DEPOSIT_AMOUNT", label: "Security Deposit (Rs.)", placeholder: "e.g. 30000" },
        { id: "START_DATE", label: "Lease Start Date", placeholder: "DD/MM/YYYY" },
        { id: "NOTICE_PERIOD", label: "Notice Period (Months)", placeholder: "e.g. 1" },
        { id: "WITNESS_1_NAME", label: "Witness 1 Name", placeholder: "" },
        { id: "WITNESS_2_NAME", label: "Witness 2 Name", placeholder: "" },
      ];
    }
    return [
      { id: "details", label: "Enter Details", placeholder: "Describe what you need in the draft...", type: "textarea" }
    ];
  };

  return (
    <div className={`messenger-shell ${step === 3 ? 'full-view' : ''}`} style={{ maxWidth: step === 3 ? '1000px' : '850px' }}>
      <div className={`messenger-welcome no-print ${step === 3 ? 'hidden' : ''}`} style={{ marginTop: '20px' }}>
        <h1>Legal Drafter</h1>
        <h2>Step {step}: {step === 1 ? "Select Document" : step === 2 ? `Enter Details` : "Review Draft"}</h2>
      </div>

      <div className="page-stack">
        {step === 1 && (
          <div className="suggestion-grid" style={{ marginTop: '0' }}>
            {(["RTI Application", "ITR Notice Reply", "Rent Agreement", "Condonation of Delay", "General Affidavit"] as DraftType[]).map(type => (
              <button key={type} className="suggestion-chip" style={{ padding: '24px', textAlign: 'left', minWidth: '200px' }} onClick={() => handleSelection(type)}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>{type}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Start drafting {type}</div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={onSubmit} className="panel field-grid">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {getFields().map(field => (
                <div key={field.id} className="field-row" style={{ gridColumn: field.type === 'textarea' ? 'span 2' : 'auto' }}>
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea required placeholder={field.placeholder} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                  ) : (
                    <input required type="text" placeholder={field.placeholder} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
            <div className="status-row" style={{ marginTop: '20px', justifyContent: 'space-between' }}>
              <button type="button" className="ghost-button" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="button" disabled={isPending}>{isPending ? "Drafting..." : "Generate Draft"}</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="status-row no-print w-full" style={{ justifyContent: 'space-between', marginBottom: '10px' }}>
               <button className="ghost-button" onClick={() => setStep(2)}>← Edit Inputs</button>
               <div className="flex gap-3">
                  <button className="button ghost" onClick={() => onSubmit()}>Regenerate</button>
                  <button className="button ghost" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Done Editing" : "Edit Text"}
                  </button>
                  <button className="button ghost" onClick={downloadAsDoc}>Download .doc</button>
                  <button className="button primary" onClick={() => window.print()}>Print / Save PDF</button>
               </div>
            </div>
            
            <div className="document-paper shadow-2xl">
              {isEditing ? (
                <textarea
                  className="document-edit-area"
                  value={editedResult}
                  onChange={(e) => {
                    setEditedResult(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onFocus={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  autoFocus
                />
              ) : (
                <div className="document-content">
                  {editedResult}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
