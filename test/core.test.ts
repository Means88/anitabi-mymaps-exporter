import { describe, expect, it } from "vitest";
import * as core from "../src/core/index.ts";

const lite = {
  id: 465493,
  cn: "",
  title: "anemoi",
  city: "北海道",
  cover: "http://lain.bgm.tv/pic/cover/l/cc/5d/465493_e3A48.jpg?plan=h160"
};

const points = [
  {
    id: "duzl6dh",
    cn: "砂川服务区（上行）",
    name: "砂川サービスエリア (上り)",
    image: "https://image.anitabi.cn/user/0/bangumi/465493/points/duzl6dh.jpg?plan=h160",
    ep: "小咏线",
    s: "Chapter11",
    geo: [43.5291, 141.9295],
    origin: "Anitabi",
    originURL: "https://anitabi.cn/"
  },
  {
    id: "dymy0us",
    name: "栄浜",
    image: "https://image.anitabi.cn/user/0/bangumi/465493/points/dymy0us.jpg?plan=h160",
    ep: null,
    geo: [44.3126, 141.6678],
    origin: "ltype",
    originLink: "https://x.com/310kattun/status/2049073623382765753?s=20"
  },
  {
    id: "bad",
    geo: ["", ""]
  }
];

describe("core export helpers", () => {
  it("normalizes points and builds CSV/KML rows", () => {
    const rows = core.buildRows(lite, points);

    expect(rows).toHaveLength(2);
    expect(rows[0].work_id).toBe("465493");
    expect(rows[1].origin_url).toBe("https://x.com/310kattun/status/2049073623382765753?s=20");
    expect(rows[0].longitude).toBe(141.9295);

    const csv = core.generateCsv(rows);
    expect(csv.startsWith("\uFEFFwork_id,work_cn,work_title")).toBe(true);
    expect(csv.includes('"砂川服务区（上行）"')).toBe(false);
    expect(csv).toContain("141.9295");

    const kml = core.generateKml(rows);
    expect(kml).toContain("<Folder>");
    expect(kml).toContain("<coordinates>141.9295,43.5291,0</coordinates>");
    expect(kml).toContain("CC BY-NC-SA 4.0");
  });

  it("builds dated export file names", () => {
    const rows = core.buildRows(lite, points);

    expect(core.makeFileName(rows, ".kml", new Date("2026-06-02T00:00:00Z"))).toBe("anitabi-465493-20260602.kml");
  });
});

describe("core search helpers", () => {
  it("parses original g.json arrays", () => {
    const index = core.parseSearchIndex([
      [
        [465493, "", 0, "anemoi", "北海道", "#65c3c2", "/images/bangumi/465493.jpg", 0, "TV", 0, 0, 0, ["a", 1, 2, 3], 0, [], 464],
        [115908, "吹响吧！上低音号", 0, "響け！ユーフォニアム", "宇治市", "#02a7bd", "/images/bangumi/115908.jpg", 0, "TV", 0, 0, 0, []]
      ],
      2
    ]);

    expect(index).toHaveLength(2);
    expect(index[0].cover).toBe("https://www.anitabi.cn/images/bangumi/465493.jpg");
    expect(core.searchWorks(index, "吹响", 5)[0].id).toBe("115908");
    expect(core.searchWorks(index, "465493", 5)[0].title).toBe("anemoi");
  });

  it("parses slim local search index payloads", () => {
    const slimIndex = core.parseSearchIndex({
      version: 1,
      items: [
        { id: "465493", cn: "", alias: "", title: "anemoi", city: "北海道", cover: "https://www.anitabi.cn/images/bangumi/465493.jpg", pointsLength: 1 },
        { id: "115908", cn: "吹响吧！上低音号", alias: "", title: "響け！ユーフォニアム", city: "宇治市", cover: "https://www.anitabi.cn/images/bangumi/115908.jpg", pointsLength: 0 }
      ]
    });

    expect(slimIndex).toHaveLength(2);
    expect(core.searchWorks(slimIndex, "宇治", 5)[0].id).toBe("115908");
  });
});
