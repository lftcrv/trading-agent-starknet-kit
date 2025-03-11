export class ParadexOrderError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParadexOrderError';
  }
}

export class ParadexCancelError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParadexCancelError';
  }
}

export class ParadexOpenOrdersError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParadexOpenOrdersError';
  }
}

export class ParadexBalanceError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParadexBalanceError';
  }
}

export class ParadexBBOError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParadexBBOError';
  }
}

export class ParadexListMarketsError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParadexListMarketsError';
  }
}
