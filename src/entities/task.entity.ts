class TaskEntity {
  constructor(
    public readonly id: number,
    public readonly plantId: number,
    public readonly description: string,
    public readonly deadlineMonth: number,
    public readonly deadlineDay: number,
    public readonly products: string[]
  ) {}
}

export { TaskEntity }
