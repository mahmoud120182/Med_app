export type Medication = {
  code: string;
  name: string;
};

export type MedicationRecord = {
  id: string;
  medicationCode: string;
  medicationName: string;
  dose: string;
  regimen: string;
  regimenMeaning?: string;
  notes: string;
  batchId: string;
  expiryDate: Date | null;
  notify?: boolean;
  notificationStartDate?: Date | null;
  notificationFrequencyValue?: number | string;
  notificationFrequencyUnit?: 'days' | 'weeks' | 'months';
};

export type BoxRecord = {
  id: string;
  boxId: string;
  cycle: string;
  packDate: Date;
  notes: string;
};

export type PatientCategory = {
  id: string;
  name: string;
};

export type Patient = {
  id: string;
  name: string;
  station: string;
  categoryIds: string[];
  specialNotes: string;
  medications: {
    regular: MedicationRecord[];
    daily: MedicationRecord[];
    depo: MedicationRecord[];
  };
  boxes: BoxRecord[];
};


export type Batch = {
  id:string;
  medicationCode: string;
  medicationName: string;
  batchId: string;
  expiryDate: Date;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
};

export type RegimenDefinition = {
  id: string;
  code: string;
  meaning: string;
};

export type Station = {
  id: string;
  name: string;
};

const today = new Date();

export const mockMedications: Medication[] = [
    { code: 'LIS10', name: 'Lisinopril 10mg' },
    { code: 'MET500', name: 'Metformin 500mg' },
    { code: 'ATO40', name: 'Atorvastatin 40mg' },
    { code: 'ASP81', name: 'Aspirin 81mg' },
    { code: 'OME20', name: 'Omeprazole 20mg' },
    { code: 'SIM20', name: 'Simvastatin 20mg' },
    { code: 'AML5', name: 'Amlodipine 5mg' },
    { code: 'MET25', name: 'Metoprolol 25mg' },
    { code: 'HCTZ25', name: 'Hydrochlorothiazide 25mg' },
    { code: 'GAB300', name: 'Gabapentin 300mg' },
    { code: 'PALIP9', name: 'Paliperidone 9mg' },
    { code: 'FLU20', name: 'Fluoxetine 20mg' },
    { code: 'DEPO-T', name: 'Testosterone Cypionate' },
    { code: 'DEPO-P', name: 'Medroxyprogesterone' },
    { code: 'FRTX', name: 'Free Text' },
    { code: 'NVMD', name: 'Non-Vialed Medication' },
];

export const mockStations: Station[] = [
  { id: 'STA001', name: 'V1' },
  { id: 'STA002', name: 'V2' },
  { id: 'STA003', name: 'F1' },
  { id: 'STA004', name: 'F2' },
  { id: 'STA005', name: 'F3' },
  { id: 'STA006', name: 'M1' },
  { id: 'STA007', name: 'M2' },
  { id: 'STA008', name: 'O' },
  { id: 'STA009', name: 'ICU' },
  { id: 'STA010', name: 'A1' },
  { id: 'STA011', name: 'A2' },
  { id: 'STA012', name: 'G' },
];

export const mockPatientCategories: PatientCategory[] = [
    { id: 'CAT001', name: 'Day Care' },
    { id: 'CAT002', name: 'Picnic' },
    { id: 'CAT003', name: 'متشابة' },
];

export const mockBatches: Batch[] = [
  { id: 'BCH001', medicationCode: 'LIS10', medicationName: 'Lisinopril 10mg', batchId: 'LP202401', expiryDate: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000), status: 'Expiring Soon' },
  { id: 'BCH002', medicationCode: 'MET500', medicationName: 'Metformin 500mg', batchId: 'MF202312', expiryDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), status: 'Expired' },
  { id: 'BCH003', medicationCode: 'ATO40', medicationName: 'Atorvastatin 40mg', batchId: 'AT202506', expiryDate: new Date(today.getTime() + 300 * 24 * 60 * 60 * 1000), status: 'Valid' },
  { id: 'BCH004', medicationCode: 'ASP81', medicationName: 'Aspirin 81mg', batchId: 'AS202402', expiryDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000), status: 'Valid' },
  { id: 'BCH005', medicationCode: 'LIS10', medicationName: 'Lisinopril 10mg', batchId: 'LP202408', expiryDate: new Date(today.getTime() + 150 * 24 * 60 * 60 * 1000), status: 'Valid' },
  { id: 'BCH006', medicationCode: 'OME20', medicationName: 'Omeprazole 20mg', batchId: 'OM202401', expiryDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), status: 'Expiring Soon' },
];

export const mockPatients: Patient[] = [
  { 
    id: '1001', 
    name: 'جون دو', 
    station: 'V1',
    categoryIds: ['CAT001'],
    specialNotes: 'لديه حساسية من البنسلين.',
    medications: {
      regular: [
        { id: 'REC002', medicationCode: 'LIS10', medicationName: 'Lisinopril 10mg', dose: '1', regimen: '1+0+0', regimenMeaning: 'قرص صباحاً', notes: 'Monitor blood pressure.', batchId: 'LP202401', expiryDate: mockBatches.find(b=>b.batchId==='LP202401')?.expiryDate || null },
        { id: 'REC003', medicationCode: 'ATO40', medicationName: 'Atorvastatin 40mg', dose: '1', regimen: '0+0+1', regimenMeaning: 'قرص مساءً', notes: 'Check lipids in 3 months.', batchId: 'AT202506', expiryDate: mockBatches.find(b=>b.batchId==='AT202506')?.expiryDate || null },
      ],
      daily: [
        { id: 'REC001', medicationCode: 'MET500', medicationName: 'Metformin 500mg', dose: '1', regimen: '1+0+1', regimenMeaning: 'قرص صباحاً ومساءً', notes: 'Initial prescription.', batchId: 'MF202312', expiryDate: mockBatches.find(b=>b.batchId==='MF202312')?.expiryDate || null },
        { id: 'REC004', medicationCode: 'ASP81', medicationName: 'Aspirin 81mg', dose: '1', regimen: '1+0+0', regimenMeaning: 'قرص صباحاً', notes: 'Take with food.', batchId: 'AS202402', expiryDate: mockBatches.find(b=>b.batchId==='AS202402')?.expiryDate || null },
        { id: 'REC005', medicationCode: 'OME20', medicationName: 'Omeprazole 20mg', dose: '1', regimen: '1+0+0', regimenMeaning: 'كبسولة صباحاً', notes: 'Review need after 8 weeks.', batchId: 'OM202401', expiryDate: mockBatches.find(b=>b.batchId==='OM202401')?.expiryDate || null },
      ],
      depo: [
        { id: 'REC021', medicationCode: 'DEPO-P', medicationName: 'Medroxyprogesterone', dose: '150', regimen: 'Q12W', regimenMeaning: 'كل 12 أسبوع', notes: 'Next injection due soon.', batchId: '', expiryDate: null, notify: true, notificationStartDate: new Date(), notificationFrequencyValue: 12, notificationFrequencyUnit: 'weeks' }
      ]
    },
    boxes: [
      { id: 'BOX001', boxId: 'JD-W22', cycle: 'Weekly', packDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), notes: 'Packed for current week.'}
    ]
  },
  { 
    id: '1002', 
    name: 'جين سميث', 
    station: 'F1',
    categoryIds: ['CAT002', 'CAT003'],
    specialNotes: 'يفضل الأدوية السائلة.',
    medications: {
      regular: [
        { id: 'REC007', medicationCode: 'AML5', medicationName: 'Amlodipine 5mg', dose: '1', regimen: '1+0+0', regimenMeaning: 'قرص صباحاً', notes: 'Patient reports mild ankle swelling.', batchId: '', expiryDate: null },
        { id: 'REC008', medicationCode: 'MET25', medicationName: 'Metoprolol 25mg', dose: '1', regimen: 'BID', regimenMeaning: 'مرتين يومياً', notes: 'Patient to self-monitor heart rate.', batchId: '', expiryDate: null },
      ],
      daily: [
        { id: 'REC006', medicationCode: 'SIM20', medicationName: 'Simvastatin 20mg', dose: '1', regimen: '0+0+1', regimenMeaning: 'قرص مساءً', notes: 'Advised to avoid grapefruit juice.', batchId: '', expiryDate: null },
        { id: 'REC009', medicationCode: 'HCTZ25', medicationName: 'Hydrochlorothiazide 25mg', dose: '1', regimen: '1+0+0', regimenMeaning: 'قرص صباحاً', notes: 'Take with a glass of water.', batchId: '', expiryDate: null },
        { id: 'REC010', medicationCode: 'GAB300', medicationName: 'Gabapentin 300mg', dose: '1', regimen: 'TID', regimenMeaning: '3 مرات يومياً', notes: 'May cause drowsiness.', batchId: '', expiryDate: null },
      ],
      depo: []
    },
    boxes: [
       { id: 'BOX002', boxId: 'JS-W22', cycle: 'Weekly', packDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), notes: 'Contains all daily meds.'}
    ]
  },
  { 
    id: '1003', 
    name: 'مايكل جونسون', 
    station: 'ICU',
    categoryIds: [],
    specialNotes: '',
    medications: {
      regular: [
        { id: 'REC012', medicationCode: 'LIS10', medicationName: 'Lisinopril 10mg', dose: '1', regimen: '1+0+0', regimenMeaning: 'قرص صباحاً', notes: 'Patient reports a dry cough.', batchId: 'LP202408', expiryDate: mockBatches.find(b=>b.batchId==='LP202408')?.expiryDate || null },
      ],
      daily: [
        { id: 'REC011', medicationCode: 'MET500', medicationName: 'Metformin 500mg', dose: '2', regimen: '0+0+2', regimenMeaning: 'قرصان مساءً', notes: 'Counselled on managing GI side effects.', batchId: '', expiryDate: null },
        { id: 'REC013', medicationCode: 'ASP81', medicationName: 'Aspirin 81mg', dose: '1', regimen: '1+0+0', regimenMeaning: 'قرص صباحاً', notes: '', batchId: 'AS202402', expiryDate: mockBatches.find(b=>b.batchId==='AS202402')?.expiryDate || null },
        { id: 'REC014', medicationCode: 'SIM20', medicationName: 'Simvastatin 20mg', dose: '1', regimen: '0+0+1', regimenMeaning: 'قرص مساءً', notes: '', batchId: '', expiryDate: null },
        { id: 'REC015', medicationCode: 'ATO40', medicationName: 'Atorvastatin 40mg', dose: '1', regimen: '0+0+1', regimenMeaning: 'قرص مساءً', notes: '', batchId: 'AT202506', expiryDate: mockBatches.find(b=>b.batchId==='AT202506')?.expiryDate || null },
      ],
      depo: [
        { id: 'REC022', medicationCode: 'DEPO-T', medicationName: 'Testosterone Cypionate', dose: '200', regimen: 'Q2W', regimenMeaning: 'كل أسبوعين', notes: 'Patient self-administers.', batchId: '', expiryDate: null, notify: true, notificationStartDate: new Date(today.getTime() - 14 * 24*60*60*1000), notificationFrequencyValue: 2, notificationFrequencyUnit: 'weeks' }
      ]
    },
    boxes: []
  },
   { 
    id: '1004', 
    name: 'إميلي ديفيس', 
    station: 'G',
    categoryIds: [],
    specialNotes: 'يحتاج إلى مساعدة في تناول الدواء.',
    medications: {
      regular: [
        { id: 'REC019', medicationCode: 'MET25', medicationName: 'Metoprolol 25mg', dose: '1', regimen: 'BID', regimenMeaning: 'مرتين يومياً', notes: '', batchId: '', expiryDate: null },
        { id: 'REC020', medicationCode: 'OME20', medicationName: 'Omeprazole 20mg', dose: '1', regimen: '1+0+0', regimenMeaning: 'كبسولة صباحاً', notes: '', batchId: 'OM202401', expiryDate: mockBatches.find(b=>b.batchId==='OM202401')?.expiryDate || null },
      ],
      daily: [
        { id: 'REC016', medicationCode: 'AML5', medicationName: 'Amlodipine 5mg', dose: '1', regimen: '1+0+0', regimenMeaning: 'قرص صباحاً', notes: '', batchId: '', expiryDate: null },
        { id: 'REC017', medicationCode: 'HCTZ25', medicationName: 'Hydrochlorothiazide 25mg', dose: '1', regimen: '1+0+0', regimenMeaning: 'قرص صباحاً', notes: '', batchId: '', expiryDate: null },
        { id: 'REC018', medicationCode: 'GAB300', medicationName: 'Gabapentin 300mg', dose: '1', regimen: 'TID', regimenMeaning: '3 مرات يومياً', notes: '', batchId: '', expiryDate: null },
      ],
      depo: []
    },
    boxes: []
  },
];


export const mockRegimens: RegimenDefinition[] = [
  { id: 'REG001', code: '1+0+0', meaning: 'قرص صباحاً' },
  { id: 'REG001-A', code: '1+0+0', meaning: 'كبسولة صباحاً' },
  { id: 'REG002', code: '0+1+0', meaning: 'قرص ظهراً' },
  { id: 'REG003', code: '0+0+1', meaning: 'قرص مساءً' },
  { id: 'REG004', code: '1+0+1', meaning: 'قرص صباحاً ومساءً' },
  { id: 'REG005', code: '1+1+0', meaning: 'قرص صباحاً وظهراً' },
  { id: 'REG006', code: '0+1+1', meaning: 'قرص ظهراً ومساءً' },
  { id: 'REG007', code: '1+1+1', meaning: 'قرص صباحاً وظهراً ومساءً' },
  { id: 'REG008', code: '1+0+2', meaning: 'قرص صباحاً وقرصان مساءً' },
  { id: 'REG009', code: 'BID', meaning: 'مرتين يومياً' },
  { id: 'REG010', code: 'TID', meaning: 'ثلاث مرات يومياً' },
  { id: 'REG011', 'code': 'QID', 'meaning': 'أربع مرات يومياً' },
  { id: 'REG012', 'code': 'Q4H', 'meaning': 'كل 4 ساعات' },
  { id: 'REG013', 'code': 'Q6H', 'meaning': 'كل 6 ساعات' },
  { id: 'REG014', 'code': 'Q8H', 'meaning': 'كل 8 ساعات' },
  { id: 'REG015', 'code': 'Q2W', 'meaning': 'كل أسبوعين' },
  { id: 'REG016', 'code': 'Q12W', 'meaning': 'كل 12 أسبوع (3 أشهر)' },
  { id: 'REG017', 'code': 'PRN', 'meaning': 'عند اللزوم' },
  { id: 'REG018', 'code': 'HS', 'meaning': 'عند النوم' },
];
