export interface StoreItem {
    id: string; code: string; name: string; category: string; unit: string; shortCode?: string; physicalNo?: string;
    styleNo?: string; colour?: string; size?: string; openingStock: number; reorderLevel: number; trackStock?: boolean; location?: string; description?: string; active: boolean;
}

export interface GatePassLine {
    _id?: string; item?: string | { _id: string; code: string; name: string; unit: string; physicalNo?: string } | null; itemCode?: string;
    job?: string | { _id: string; designNo: string; garmentType?: string; party?: string } | null;
    description: string; styleNo?: string; size?: string; quantity: number; unit?: string; bundles?: number | null; remark?: string;
}

export type Direction = 'out' | 'in';

export interface GatePass {
    id: string; direction: Direction; number: string; bookNo?: string; date: string; party: string; contactPerson?: string; invoiceNo?: string;
    vehicleNo?: string; purpose?: string; lines: GatePassLine[];
    job?: string | { _id: string; designNo: string; garmentType?: string; dueDate?: string | null; dueTime?: string | null } | null; jobQty?: number | null; checkedBy?: string; authorisedBy?: string; note?: string;
    status: 'posted' | 'cancelled'; cancelReason?: string; createdBy?: { name: string }; createdAt?: string;
}

export interface StockRow {
    id: string; code: string; name: string; category: string; unit: string; physicalNo?: string; shortCode?: string; location?: string;
    reorderLevel: number; openingStock: number; trackStock: boolean; in: number; out: number; adjustment: number; balance: number; lastMovement: string | null; low: boolean;
}

/** Cut pieces received for one design number, to stitch and send back finished by the due date. */
export interface DesignJob {
    id: string; party: string; designNo: string; garmentType?: string; orderQty?: number | null; receivedDate?: string | null;
    dueDate?: string | null; dueTime?: string | null; note?: string; closed?: boolean;
    received: number; completed: number; target: number; balance: number; extra: number; inPasses: number; lastOut?: string | null;
    state: 'in_progress' | 'due_today' | 'overdue' | 'completed' | 'closed';
}

export const GARMENT_TYPES = ['Pant', 'Trouser', 'Short', 'Frock', 'Dress', 'Skirt', 'Shirt', 'Blouse', 'T-shirt', 'Kids wear'];

export const JOB_STATE: Record<DesignJob['state'], { label: string; color: string }> = {
    in_progress: { label: 'In progress', color: 'blue' },
    due_today: { label: 'Due today', color: 'orange' },
    overdue: { label: 'Overdue', color: 'red' },
    completed: { label: 'Completed', color: 'green' },
    closed: { label: 'Closed', color: 'default' },
};

export const CATEGORIES: { value: string; label: string; color: string }[] = [
    { value: 'fabric', label: 'Fabric', color: 'blue' },
    { value: 'trim', label: 'Trims & accessories', color: 'purple' },
    { value: 'thread', label: 'Thread', color: 'cyan' },
    { value: 'cut_part', label: 'Cut parts', color: 'orange' },
    { value: 'finished_garment', label: 'Finished garments', color: 'green' },
    { value: 'sample', label: 'Samples', color: 'magenta' },
    { value: 'packing', label: 'Packing', color: 'geekblue' },
    { value: 'machine_part', label: 'Machine parts', color: 'volcano' },
    { value: 'other', label: 'Other', color: 'default' },
];
export const categoryOf = (v?: string) => CATEGORIES.find(c => c.value === v) || CATEGORIES[CATEGORIES.length - 1];

export const UNITS = ['pcs', 'pairs', 'bundles', 'dozen', 'm', 'yd', 'kg', 'g', 'cones', 'rolls', 'boxes', 'packets', 'sets'];

export const qty = (n?: number | null) => (n == null ? '—' : Number(n).toLocaleString('en-LK', { maximumFractionDigits: 3 }));
export const itemId = (i: GatePassLine['item'] | GatePassLine['job']) => (i && typeof i === 'object' ? i._id : i) || null;

/** Wording that changes between gate pass out and in. */
export const DIR_TEXT: Record<Direction, { title: string; short: string; party: string; partyHint: string; verb: string; subtitle: string }> = {
    out: {
        title: 'Gate Pass Out', short: 'Out', party: 'Send to', partyHint: 'e.g. Aken Apparel (Pvt) Ltd', verb: 'sent',
        subtitle: 'Goods leaving the factory: finished garments back to the customer by design number, samples, returns. Pick the design job to count the garments as completed.',
    },
    in: {
        title: 'Gate Pass In', short: 'In', party: 'Received from', partyHint: 'e.g. Aken Apparel (Pvt) Ltd', verb: 'received',
        subtitle: 'Goods coming in: cut pieces from customers with a design number and due date, plus fabric and trims. Cut pieces start a job you complete and send out.',
    },
};
