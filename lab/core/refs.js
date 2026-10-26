/* BOYLE LAB · Bibliografia
   Solo riferimenti controllati. Gli articoli hanno PMID e DOI verificati su PubMed
   (26/10/2026); norme, libri e rapporti tecnici hanno l'URL della fonte ufficiale o l'ISBN. */
export const REFS = Object.freeze({
  severinghaus1979: {
    text: 'Severinghaus JW. Simple, accurate equations for human blood O2 dissociation computations. J Appl Physiol Respir Environ Exerc Physiol. 1979;46(3):599-602.',
    doi: '10.1152/jappl.1979.46.3.599', pmid: '35496',
  },
  fenn1946: {
    text: 'Fenn WO, Rahn H, Otis AB. A theoretical study of the composition of the alveolar air at altitude. Am J Physiol. 1946;146:637-53.',
    doi: '10.1152/ajplegacy.1946.146.5.637', pmid: '20996488',
  },
  boycott1908: {
    text: 'Boycott AE, Damant GC, Haldane JS. The prevention of compressed-air illness. J Hyg (Lond). 1908;8(3):342-443.',
    doi: '10.1017/s0022172400003399', pmid: '20474365',
  },
  coburn1965: {
    text: 'Coburn RF, Forster RE, Kane PB. Considerations of the physiological variables that determine the blood carboxyhemoglobin concentration in man. J Clin Invest. 1965;44(11):1899-910.',
    doi: '10.1172/JCI105296', pmid: '5845666',
  },
  buhlmann2002: {
    text: 'Bühlmann AA, Völlm EB, Nussberger P. Tauchmedizin: Barotrauma, Gasembolie, Dekompression, Dekompressionskrankheit, Dekompressionscomputer. 5ª ed. Berlin: Springer; 2002.',
    isbn: '9783540429791',
  },
  schreiner1971: {
    text: 'Schreiner HR, Kelley PL. A pragmatic view of decompression. In: Lambertsen CJ, ed. Underwater Physiology IV. New York: Academic Press; 1971.',
  },
  iso2533: {
    text: 'ISO 2533:1975. Standard Atmosphere. International Organization for Standardization.',
    url: 'https://www.iso.org/standard/7472.html',
  },
  codata2018: {
    text: 'CODATA 2018, costante molare dei gas R (valore esatto nel SI 2019). NIST Reference on Constants, Units and Uncertainty.',
    url: 'https://physics.nist.gov/cgi-bin/cuu/Value?r',
  },
  cfr25841: {
    text: 'U.S. Code of Federal Regulations, 14 CFR § 25.841 Pressurized cabins (quota di cabina non superiore a 8 000 ft in condizioni operative normali).',
    url: 'https://www.ecfr.gov/current/title-14/section-25.841',
  },
  nasa2015hypoxia: {
    text: 'NASA Human Research Program. Evidence Report: Risk of Hypobaric Hypoxia from the Exploration Atmosphere. JSC-CN-34806; 2015 (ambiente 8,2 psia / 34% O2).',
    url: 'https://ntrs.nasa.gov/citations/20150021491',
  },
  bipm_si: {
    text: 'BIPM. The International System of Units (SI), 9ª ed., 2019 (atmosfera standard 101 325 Pa; accelerazione di gravità standard 9,806 65 m/s²).',
    url: 'https://www.bipm.org/en/publications/si-brochure',
  },
  west_resp: {
    text: 'West JB, Luks AM. West\'s Respiratory Physiology: The Essentials. Wolters Kluwer (testo di riferimento per contenuto di O2, solubilità 0,003 mL/dL/mmHg e principio di Fick).',
  },
});

export function refLink(r) {
  if (r.doi) return 'https://doi.org/' + r.doi;
  if (r.pmid) return 'https://pubmed.ncbi.nlm.nih.gov/' + r.pmid + '/';
  return r.url || null;
}
