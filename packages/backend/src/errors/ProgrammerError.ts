export class ProgrammerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProgrammerError';
  }
}