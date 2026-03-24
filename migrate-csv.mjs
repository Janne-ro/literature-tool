/**
 * Reconstruct all papers from manually-extracted data and write clean TSV.
 * Run: node migrate-csv.mjs
 */
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = join(__dirname, 'data', 'papers.csv')

const CSV_COLUMNS = [
  'ID', 'Link', 'Authors', 'Year', 'Title', 'Article type', 'Venue',
  'Direct quotes', 'Other info', 'Bibtex citation', 'Related papers', 'Tags'
]

// ── Paper data (manually extracted from the broken CSV) ────────────────────

const papers = [
  {
    ID: 'ID_001',
    Link: 'https://eric.ed.gov/?id=EJ1086242',
    Authors: 'Sajna Jaleel;P Premachandran',
    Year: '2016',
    Title: 'A Study on the Metacognitive Awareness of Secondary School Students',
    'Article type': 'Article',
    Venue: 'Universal Journal of Educational Research',
    'Direct quotes': [
      '* **Metacognition means "thinking about one\'s own thinking"**. There are two aspects of metacognition:',
      '- **reflection-thinking** about what we know and',
      '- **self-regulation-managing** how we go about learning.',
      '* Metacognitive awareness means being aware of how you think [...] **It enables students to be more mindful of what they are doing**, and why, and of how the skills they are learning might be used differently in different situations.',
      '* **students show a considerable variation in their metacognitive ability**',
      '* Learners often show an **increase in self-confidence** when they build metacognitive skills',
      '* For all age groups, metacognitive knowledge is crucial for efficient independent learning, because it fosters forethought and self-reflection. **Good metacognitive thinkers are also good intentional learners.**',
      '* Activities that encourage a reflective and strategic stance towards learning should be embedded in the regular activities of a classroom',
    ].join(';'),
    'Other info': [
      '* there is **no significant difference** in the metacognitive awareness of secondary school students **based on Gender, Location or type of management of the school**',
      '* Can be used to snowball some studies using older metacognitive awareness tools',
      '* Generally can be used to snowball a vairety of studies with nice summarys for each',
    ].join(';'),
    'Bibtex citation': '@article{jaleel2016study, title={A Study on the Metacognitive Awareness of Secondary School Students.}, author={Jaleel, Sajna and Premachandran, P.}, journal={Universal journal of educational research}, volume={4}, number={1}, pages={165--172}, year={2016}, publisher={ERIC}, doi={10.13189/ujer.2016.040121}}',
    'Related papers': 'ID_004 | Discusses other differences in metacognitive skills',
    Tags: 'Metacognition;Empirical;Metacognition - Importance;Metacognition - Differences;Secondary Education',
  },
  {
    ID: 'ID_002',
    Link: 'https://eric.ed.gov/?id=EJ1086242',
    Authors: 'Janne Rotter;William Bailkoski',
    Year: '2026',
    Title: 'AI Adoption in NGOs: A Systematic Literature Review',
    'Article type': 'Article',
    Venue: 'ACM JCSS',
    'Direct quotes': 'Test 1.1;Test 2.1',
    'Other info': 'Test 1.1',
    'Bibtex citation': '@article{rotter2026ai}',
    'Related papers': '',
    Tags: 'Survey',
  },
  {
    ID: 'ID_003',
    Link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8734377/',
    Authors: 'Julie Dangremond Stanton;Amanda J Sebesta;John Dunlosky',
    Year: '2021',
    Title: 'Fostering Metacognition to Support Student Learning and Performance',
    'Article type': 'Article',
    Venue: 'CBE Life Science Education',
    'Direct quotes': [
      '* Strong **metacognitive skills have the power to impact student learning and performance**',
      '* The ways students enact the same learning strategy can differ greatly',
      '* **Students often rate their confidence in their learning based on their ability to recognize, rather than [acuratly] recall**, concepts.',
      '* Three main areas in which faculty can foster students\' metacognition: supporting student learning strategies (i.e., study skills), encouraging monitoring and control of learning, and promoting social metacognition during group work',
      '* Summarizes metacognitive strategys:',
      '* **Craming** Issue: Some students use approaches that engage their metacognition, but they often do so without a full understanding of the benefits of these approaches (Karpicke et al., 2009). Students tend to cram because this approach is often effective for boosting short-term performance, although it does not promote long-term retention.',
      '* **Self-testing**: provides students with opportunities to monitor their understanding of material and identify gaps in their understanding. Self-testing also allows students to activate relevant knowledge and encode prompted information so it can be more easily accessed from their memory in the future (Dunlosky et al., 2013)',
      '* **Spacing** Mechanism: Students space their studying when they spread their learning of the same material over multiple sessions. When students spread their learning over multiple sessions, they are less susceptible to superficial familiarity with concepts (Kornell and Bjork, 2008).',
      '* **Interleaving** Mechanism: Students interleave when they alternate studying of information from one category with studying of information from another category. This allows students to discriminate across categories (Rohrer et al., 2020). Interleaving between categories also supports student learning because it usually results in spacing of study.',
      '* **Surface and deep strategies**: Deep strategies involve extending and connecting ideas or applying knowledge in new ways. Surface strategies involve recalling and reproducing content. Can be used together (Hattie and Donoghue, 2016).',
      '* **Social metacognition**: Social metacognition happens when students share ideas with peers, invite peers to evaluate their ideas, and evaluate ideas shared by peers (Goos et al., 2002).',
    ].join(';'),
    'Other info': [
      '* Developed a teacher guide for how to use metacgonition based on literature',
      '* Challenges: metacognition is a term used so broadly its meaning may not be clear (Veenman et al., 2006). It includes multiple processes named differently across disciplines. The tacit nature of metacognitive processes makes it difficult for instructors to observe or measure.',
    ].join(';'),
    'Bibtex citation': '@article{stanton2021fostering, title={Fostering metacognition to support student learning and performance}, author={Stanton, Julie Dangremond and Sebesta, Amanda J and Dunlosky, John}, journal={CBE—Life Sciences Education}, volume={20}, number={2}, pages={fe3}, year={2021}, publisher={American Society for Cell Biology}, doi={10.1187/cbe.20-12-0289}}',
    'Related papers': '',
    Tags: 'Metacognition;Metacognition - Importance;Theoretical;Metacognition - Challenges',
  },
  {
    ID: 'ID_004',
    Link: 'https://www.mdpi.com/2075-4698/15/1/6',
    Authors: 'Michael Gerlich',
    Year: '2026',
    Title: 'AI Tools in Society: Impacts on Cognitive Offloading and the Future of Critical Thinking',
    'Article type': 'Article',
    Venue: 'Societies',
    'Direct quotes': [
      '* Findings revealed a **significant negative correlation between frequent AI tool usage and critical thinking abilities**, mediated by increased cognitive offloading',
      '* **Younger participants exhibited higher dependence on AI tools and lower critical thinking scores compared to older participants**. Higher educational attainment was associated with better critical thinking skills regardless of AI usage.',
      '* **Negative effects of cognitive offloading**: Cognitive offloading involves using external tools to reduce cognitive load on working memory. While this can free up cognitive resources, it may lead to a decline in cognitive engagement and skill development. **Excessive reliance on external aids may lead to a decline in internal cognitive abilities** such as memory retention and critical analysis skills.',
      '* **Potential negative impact of AI tools**: Gerlich (2024) shows that AI in educational settings does not always improve cognitive or communication skills, particularly in students who already demonstrate well-developed abilities. Increased trust in AI tools can result in greater cognitive offloading, reducing engagement in critical thinking.',
      '* **Cognitive load theory**: Developed by Sweller (1988), posits that the human cognitive system has limited capacity and reducing cognitive load can enhance learning and performance.',
      '* **Empirical verifications**: Students who heavily relied on AI dialogue systems exhibited diminished decision-making and critical analysis abilities (Zhai et al.). Over-reliance on AI tools led to reduced problem-solving skills with lower engagement in independent cognitive processing (Krullaars et al.).',
    ].join(';'),
    'Other info': [
      '* Discusses and summarizes tools for assesing critical thinking skills',
      '* AI: The central paradox at the nexus of AI and learning is the tension between a student\'s desire for efficiency and the cognitive effort required for deep learning. While AI tools can provide instant answers, this convenience comes with a significant potential cost: a decline in critical thinking and problem-solving abilities. This phenomenon is known as "cognitive offloading."',
    ].join(';'),
    'Bibtex citation': '@article{gerlich2025ai, title={AI tools in society: Impacts on cognitive offloading and the future of critical thinking}, author={Gerlich, Michael}, journal={Societies}, volume={15}, number={1}, pages={6}, year={2025}, publisher={Multidisciplinary Digital Publishing Institute}, doi={10.3390/soc15010006}}',
    'Related papers': '',
    Tags: 'Main Paper;Metacognition;Cognitive Offloading;AI - Negative Impact;Metacognition - Differences',
  },
  {
    ID: 'ID_005',
    Link: 'https://www.sciencedirect.com/science/article/abs/pii/B9780121098902500317',
    Authors: 'Barry Zimmermann',
    Year: '2000',
    Title: 'Attaining Self-Regulation: A Social Cognitive Perspective',
    'Article type': 'Book Chapter',
    Venue: 'Handbook of Self-Regulation',
    'Direct quotes': '',
    'Other info': [
      '* **Zimmerman\'s Self-Regulated Learning (SRL) Model** explains how learners actively control their own learning through a cyclical process. It emphasizes metacognition, motivation, and behavior.',
      '* **1. Forethought Phase (Before Learning)**: Focuses on planning and motivation. Learners set goals, plan strategies, and develop self-motivation beliefs (e.g., self-efficacy, outcome expectations, intrinsic interest, goal orientation). Key processes: goal setting, strategic planning, self-motivation.',
      '* **2. Performance Phase (During Learning)**: Focuses on strategy use and self-control. Learners implement strategies, monitor progress, and manage attention and effort. Key processes: attention focusing, task strategies, self-instruction, monitoring.',
      '* **3. Self-Reflection Phase (After Learning)**: Focuses on evaluating performance. Learners judge progress against goals, attribute causes of success/failure, and develop adaptive reactions. Key processes: self-evaluation, causal attribution, self-satisfaction, adaptive/defensive responses.',
      '* **Core Idea**: Zimmerman\'s model is **cyclical**: reflection influences future forethought, meaning learners refine goals and strategies based on past experiences.',
    ].join(';'),
    'Bibtex citation': '@incollection{zimmerman2000attaining, title={Attaining self-regulation: A social cognitive perspective}, author={Zimmerman, Barry J}, booktitle={Handbook of self-regulation}, pages={13--39}, year={2000}, publisher={Elsevier}}',
    'Related papers': '',
    Tags: 'Main Paper;Self-regulation;Foundational Paper',
  },
]

// ── Verify no fields contain tabs ──────────────────────────────────────────

let issues = 0
for (const p of papers) {
  for (const [col, val] of Object.entries(p)) {
    if (String(val).includes('\t')) {
      console.error(`ERROR: tab found in ${p.ID} / ${col}`)
      issues++
    }
  }
}
if (issues) { process.exit(1) }

// ── Write TSV ──────────────────────────────────────────────────────────────

const tsv = Papa.unparse(papers, { columns: CSV_COLUMNS, delimiter: '\t' })
writeFileSync(outputPath, tsv, 'utf8')

console.log(`Wrote ${papers.length} papers to ${outputPath}`)
papers.forEach(p => console.log(`  ${p.ID} — ${p.Title}`))
console.log('Done.')
