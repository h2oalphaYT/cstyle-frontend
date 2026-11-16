import type { GatePass } from './types';

/** Header of the printed gate pass, as on the C STYLE gate pass book. */
export const COMPANY = {
    name: 'C STYLE (PVT) Ltd.',
    phones: '+9471 4563924 | +9471 8851455 | +9476 1303924',
    email: 'ajith329@gmail.com',
    factory: ['New Town,', 'Pitigala'],
    office: ['No: 284/B/1,', 'Sugathadassi Mawatha,', 'Pitigala'],
};

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const fmtDate = (d: string) => d.split('-').reverse().join(' / ');
const n = (v: number) => Number(v).toLocaleString('en-LK', { maximumFractionDigits: 3 });

/** Opens the gate pass as an A5 page in a new window and starts printing. */
export function printGatePass(gp: GatePass, target?: Window | null) {
    const rows = gp.lines.map((l, i) => {
        const desc = [l.itemCode && `<b>${esc(l.itemCode)}</b>`, esc(l.description), l.styleNo && !String(l.description).includes(l.styleNo) && `Design ${esc(l.styleNo)}`].filter(Boolean).join(' &middot; ');
        const remark = [l.bundles ? `${l.bundles} bundle${l.bundles > 1 ? 's' : ''}` : '', esc(l.remark)].filter(Boolean).join(', ');
        return `<tr><td class="c">${i + 1}</td><td>${desc}</td><td class="c">${esc(l.size)}</td><td class="r">${n(l.quantity)} <small>${esc(l.unit)}</small></td><td>${remark}</td></tr>`;
    });
    const blank = Math.max(0, 14 - rows.length);
    for (let i = 0; i < blank; i += 1) rows.push('<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>');
    const total = gp.lines.reduce((s, l) => s + l.quantity, 0);
    const job = gp.job && typeof gp.job === 'object' ? gp.job : null;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(gp.number)}</title><style>
@page { size: A5 portrait; margin: 8mm; }
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; font-size: 11px; }
.sheet { border: 1.5px solid #111; padding: 10px 12px; }
.head { display: grid; grid-template-columns: 70px 1fr; align-items: center; gap: 8px; }
.logo { font: italic 700 30px Georgia, serif; }
.title { text-align: center; }
.title h1 { margin: 0; font-size: 20px; letter-spacing: .5px; }
.badge { display: inline-block; background: #111; color: #fff; font-weight: 800; letter-spacing: 3px; padding: 2px 14px; margin: 3px 0; font-size: 14px; }
.dir { display: inline-block; border: 1.5px solid #111; font-weight: 800; padding: 1px 8px; margin-left: 6px; font-size: 12px; }
.contact { font-size: 10.5px; font-weight: 600; }
.addr { display: flex; justify-content: space-between; border-bottom: 1.5px solid #111; padding: 6px 0; margin-bottom: 8px; font-size: 10.5px; }
.fields { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 18px; margin-bottom: 8px; }
.f { display: flex; gap: 6px; } .f b { white-space: nowrap; } .f span { flex: 1; border-bottom: 1px dotted #111; min-height: 14px; }
.wide { grid-column: span 2; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #111; padding: 3px 5px; height: 20px; vertical-align: top; }
th { font-size: 11px; } .c { text-align: center; } .r { text-align: right; white-space: nowrap; }
tfoot td { font-weight: 700; }
.sign { display: flex; justify-content: space-between; align-items: end; margin-top: 30px; }
.sign > div { width: 34%; text-align: center; } .sign .line { border-top: 1px dotted #111; padding-top: 3px; font-weight: 600; }
.no { color: #c0392b; font-size: 18px; font-weight: 700; }
.void { color: #c0392b; font-weight: 800; text-align: center; border: 2px solid #c0392b; padding: 4px; margin-bottom: 6px; }
small { color: #555; }
</style></head><body><div class="sheet">
${gp.status === 'cancelled' ? `<div class="void">CANCELLED${gp.cancelReason ? ` — ${esc(gp.cancelReason)}` : ''}</div>` : ''}
<div class="head"><div class="logo">C<span style="font-size:20px">style</span></div><div class="title">
<h1>${esc(COMPANY.name)}</h1><div><span class="badge">GATE PASS</span><span class="dir">${gp.direction === 'out' ? 'OUT' : 'IN'}</span></div>
<div class="contact">${esc(COMPANY.phones)}</div><div class="contact">Email: ${esc(COMPANY.email)}</div></div></div>
<div class="addr"><div><b>Factory :</b> ${COMPANY.factory.map(esc).join('<br>')}</div><div><b>Office :</b> ${COMPANY.office.map(esc).join('<br>')}</div></div>
<div class="fields">
<div class="f"><b>Date :</b><span>${esc(fmtDate(gp.date))}</span></div>
<div class="f"><b>Invoice No :</b><span>${esc(gp.invoiceNo)}</span></div>
<div class="f wide"><b>${gp.direction === 'out' ? 'Send to' : 'Received from'} :</b><span>${esc(gp.party)}</span></div>
<div class="f"><b>Contact Person :</b><span>${esc(gp.contactPerson)}</span></div>
<div class="f"><b>Vehicle No :</b><span>${esc(gp.vehicleNo)}</span></div>
${job ? `<div class="f"><b>Design No :</b><span>${esc(job.designNo)}${job.garmentType ? ` (${esc(job.garmentType)})` : ''}${gp.jobQty ? ` &middot; ${n(gp.jobQty)} pcs` : ''}</span></div>
<div class="f"><b>Due :</b><span>${job.dueDate ? esc(fmtDate(job.dueDate)) : ''} ${esc(job.dueTime || '')}</span></div>` : ''}
</div>
<table><thead><tr><th style="width:34px">S/No</th><th>Description</th><th style="width:48px">Size</th><th style="width:64px">Qty</th><th style="width:96px">Remark</th></tr></thead>
<tbody>${rows.join('')}</tbody>
<tfoot><tr><td></td><td class="r">Total</td><td></td><td class="r">${n(total)}</td><td></td></tr></tfoot></table>
${gp.note ? `<p style="margin:6px 0 0"><b>Note:</b> ${esc(gp.note)}</p>` : ''}
<div class="sign"><div><div style="min-height:14px">${esc(gp.checkedBy)}</div><div class="line">Checked by</div></div>
<div class="no">${esc(gp.bookNo || gp.number)}</div>
<div><div style="min-height:14px">${esc(gp.authorisedBy)}</div><div class="line">Authorised by</div></div></div>
<p style="text-align:right;margin:6px 0 0"><small>${esc(gp.number)}</small></p>
</div><script>window.onload = () => { window.focus(); window.print(); };</script></body></html>`;
    const w = target || window.open('', '_blank', 'width=720,height=900');
    if (!w) return false;
    w.document.open();
    w.document.write(html);
    w.document.close();
    return true;
}
