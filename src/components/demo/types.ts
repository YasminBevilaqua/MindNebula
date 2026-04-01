export type ChatTurn = {
  id: string;
  userMessage: string;
  assistantMessage: string | null;
  error: string | null;
  pending: boolean;
};
