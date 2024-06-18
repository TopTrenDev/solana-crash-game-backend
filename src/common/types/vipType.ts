export interface VIPLevelType {
  name: string;
  wagerNeeded: string; // Since you're using toFixed, it's a string
  rakebackPercentage: string; // Since you're using toFixed, it's a string
  levelName: string;
  levelColor: string;
}
