class PlantEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly type: string,
    public readonly status: "draft" | "active",
    public readonly sources: string[]
  ) {}
}

export { PlantEntity }
