export class MultiParserError extends Error{
  constructor(message: string){
    super(message)
    this.name = "MultiparserError"
  }
}