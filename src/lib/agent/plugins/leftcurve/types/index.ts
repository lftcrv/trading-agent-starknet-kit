export interface AvnuAnalysisParams {
}

export interface AssetAnalysis {
  social: null;
  assetId: string;
  metadata: {
      platform: string;
      dataSource: string;
      generatedAt: string;
      processingTimeMs: number;
  };
  technical: {
      changes: Record<string, string>;
      lastPrice: number;
      keySignals: {
          longTerm: {
              support: number;
              timeframe: string;
              resistance: number;
          };
          shortTerm: {
              momentum: {
                  rsi: {
                      value: number;
                      condition: string;
                  };
                  macd: {
                      signal: string;
                      strength: number;
                  };
                  stochastic: {
                      d: number;
                      k: number;
                      condition: string;
                  };
              };
              patterns: {
                  recent: Array<{
                      type: string;
                      strength: number;
                  }>;
              };
              timeframe: string;
          };
          mediumTerm: {
              trend: {
                  price: {
                      action: {
                          strength: number;
                          direction: string;
                          testedLevels: {
                              count: number;
                              recent: number;
                          };
                      };
                      volatility: {
                          state: string;
                          bbWidth: number;
                      };
                  };
                  primary: {
                      momentum: {
                          value: number;
                          period: number;
                          sustainedPeriods: number;
                      };
                      strength: number;
                      direction: string;
                  };
              };
              timeframe: string;
              technicals: {
                  levels: {
                      pivots: {
                          r1: number;
                          s1: number;
                          pivot: number;
                          breakout: string;
                          r1Distance: number;
                      };
                  };
                  volume: {
                      trend: string;
                      profile: {
                          activity: number;
                          distribution: string;
                          sustainedPeriods: number;
                      };
                      significance: number;
                  };
                  ichimoku: {
                      lines: {
                          base: number;
                          conversion: number;
                          priceDistance: number;
                      };
                      signal: string;
                      cloudState: string;
                  };
                  momentum: {
                      adx: {
                          value: number;
                          trending: boolean;
                          sustainedPeriods: number;
                      };
                      roc: {
                          state: string;
                          value: number;
                          period: number;
                      };
                  };
              };
          };
      };
      volatility: number;
  };
  timestamp: number;
}