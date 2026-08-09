const frameworkOsLayers = [
  {
    key: "input",
    name: "Input",
    responsibility: "Gather signals without treating them as final truth.",
    outputContract: "source signals, user signals, diagnostics, and raw operational observations"
  },
  {
    key: "knowledge",
    name: "Knowledge",
    responsibility: "Convert inputs into structured knowledge objects.",
    outputContract: "dossiers, source registries, claim ledgers, entity graphs, timelines, memory records"
  },
  {
    key: "understanding",
    name: "Understanding",
    responsibility: "Determine what the evidence means before decisions are made.",
    outputContract: "meaning answers, evidence maps, misunderstanding risks, prohibited inferences, emphasis guidance"
  },
  {
    key: "reasoning",
    name: "Reasoning",
    responsibility: "Decide what follows from understanding.",
    outputContract: "decision graph, paragraph plan, attribution plan, repair route, execution contract"
  },
  {
    key: "coordination",
    name: "Coordination",
    responsibility: "Assign ownership, sequence work, suppress duplicate fixes, and decide whether execution is allowed.",
    outputContract: "owner subsystem, wait/act decision, governance route, shared-cause classification"
  },
  {
    key: "execution",
    name: "Execution",
    responsibility: "Turn approved decisions into outputs.",
    outputContract: "article, headline, image, newsletter, creator post, code patch, operational action"
  },
  {
    key: "verification",
    name: "Verification",
    responsibility: "Prove the output matches standards and the approved understanding.",
    outputContract: "quality result, visibility proof, alignment result, safety/license result"
  },
  {
    key: "optimization",
    name: "Optimization",
    responsibility: "Reduce unnecessary work while preserving or improving output quality.",
    outputContract: "efficiency finding, cost-per-output metric, bounded improvement proposal"
  },
  {
    key: "learning",
    name: "Learning",
    responsibility: "Distill outcomes into reusable knowledge, behavior changes, and prevention rules.",
    outputContract: "semantic memory, skill memory, pattern memory, reasoning memory, prevention rule"
  },
  {
    key: "governance",
    name: "Governance",
    responsibility: "Control permissions, auditability, rollback, owner approval, and safe execution.",
    outputContract: "approval decision, audit record, rollback path, release gate result"
  }
];

function frameworkOsContract() {
  return {
    version: "20260806-framework-os-understanding-contract-v1",
    sequence: frameworkOsLayers.map(layer => layer.name),
    layers: frameworkOsLayers,
    rule: "Understanding is a permanent Framework OS layer between Knowledge and Reasoning. Reasoning may not reconstruct meaning directly from raw inputs when an Understanding object is required.",
    newsLabApplicationRule: "News Lab writers consume Story Understanding produced from a locked canonical dossier before Writer Reasoning and article execution.",
    portabilityRule: "Other applications should create their own Understanding object from their canonical knowledge object before reasoning or execution."
  };
}

module.exports = { frameworkOsLayers, frameworkOsContract };
