import { upsertDecision } from "../chat-sync"

describe("сведение копий диалога", () => {
  it("новый диалог заводится, свежая копия перезаписывает, старая — нет", () => {
    expect(upsertDecision(null, 10)).toBe("create")
    expect(upsertDecision({ client_updated_at: 10, removed: false }, 20)).toBe("update")
    expect(upsertDecision({ client_updated_at: 10, removed: false }, 10)).toBe("update")
    expect(upsertDecision({ client_updated_at: 30, removed: false }, 20)).toBe("stale")
  })

  it("удалённый диалог не воскресает", () => {
    expect(upsertDecision({ client_updated_at: 10, removed: true }, 99)).toBe("removed")
  })
})
