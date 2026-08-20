// Shape of the data extracted from a target-sheet photo by Claude's vision.

export interface ShotSeries {
  seriesIndex: number;       // 1-based, e.g. 1 for shots 1..10
  shotRange: string;         // e.g. "1..10"
  shots: number[];           // individual shot values in shooting order, decimal (e.g. 10.5, 9.6)
  seriesSum: number;         // decimal sum, e.g. 99.5
  seriesIntegerSum?: number; // integer sum shown in brackets, e.g. 96
  groupDiameterMm?: number;  // Ø of the group for this series, if shown
  centerOffsetXMm?: number;  // horizontal offset of group center from bull, mm (+ right)
  centerOffsetYMm?: number;  // vertical offset of group center from bull, mm (+ up)
  notes?: string;            // any qualitative notes about shape (e.g. "vertical stringing")
}

export interface ExtractedSessionData {
  shooterName?: string;
  licenseNumber?: string;
  club?: string;
  discipline?: string;               // e.g. "Luchtgeweer staand"
  category?: string;                 // e.g. "Dames A-klasse"
  sessionDateTime?: string;          // ISO-ish string as printed on the sheet
  totalShots: number;                // usually 60
  series: ShotSeries[];
  totalScoreDecimal: number;         // e.g. 584.4
  totalScoreInteger?: number;        // e.g. 561
  scoreDistribution?: {              // counts across the whole session
    tens?: number;
    nines?: number;
    eights?: number;
    sevens?: number;
    sixOrBelow?: number;
  };
  innerTens?: number;                // count of "inner ten" (10.x with high decimal / X-ring)
  averagePerShot?: number;           // e.g. 9.74
  overallGroupDiameterMm?: number;
  extractionNotes?: string;          // anything illegible/uncertain, for the user to verify
}

export interface CoachingAnalysis {
  summary: string;                        // 2-4 sentence overview
  strengths: string[];                    // what the shooter did well, evidence-based
  likelyCauses: {
    observation: string;                  // pattern observed in the data (e.g. "series 4 dropped to 93.7")
    possibleTechnicalCause: string;       // professional interpretation
    linkedToReflection?: string;          // connection to shooter's own notes, if relevant
  }[];
  practiceRecommendations: {
    focusArea: string;                    // e.g. "Trigger control", "Hold stability"
    drill: string;                        // concrete drill/exercise
    rationale: string;
  }[];
  trendNote?: string;                     // note referencing historical sessions, if available
  goalProgress?: {
    targetScore: number;                  // the shooter's standing goal, e.g. 610
    currentSessionScore: number | null;
    gapToTarget: number | null;           // targetScore - currentSessionScore
    recentAverageScore: number | null;    // average total across recent sessions, incl. this one
    consistencyNote: string;              // is this a one-off good session, or a repeatable habit?
  };
  mandarinExplanation?: string;           // full explanation of the above analysis, in Mandarin Chinese
}

export interface SessionRecord {
  id: string;
  shooter_id: string;
  session_date: string | null;
  discipline: string | null;
  image_url: string | null;
  extracted_data: ExtractedSessionData;
  reflection_text: string | null;
  analysis: CoachingAnalysis | null;
  total_score: number | null;
  average_score: number | null;
  inner_tens: number | null;
  created_at: string;
}
