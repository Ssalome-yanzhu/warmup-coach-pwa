import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { getSports, getAgeGroups, getRoutine } from "./server/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // ===== 视频静态文件托管 =====
  const videosPath = path.join(__dirname, "videos");
  app.use("/videos", express.static(videosPath));

  // ===== API 路由 =====

  // 获取所有运动项目列表
  app.get("/api/sports", (_req, res) => {
    try {
      const sports = getSports();
      res.json(sports);
    } catch (error) {
      console.error("Error fetching sports:", error);
      res.status(500).json({ error: "获取运动列表失败" });
    }
  });

  // 获取年龄组列表
  app.get("/api/age-groups", (_req, res) => {
    try {
      const ageGroups = getAgeGroups();
      res.json(ageGroups);
    } catch (error) {
      console.error("Error fetching age groups:", error);
      res.status(500).json({ error: "获取年龄组失败" });
    }
  });

  // 获取热身/拉伸方案
  app.get("/api/routine", (req, res) => {
    try {
      const { sport, age, type } = req.query;

      if (!sport || !age || !type) {
        return res.status(400).json({
          error: "请提供运动项目(sport)、年龄段(age)和方案类型(type:warmup/stretch)",
        });
      }

      const validTypes = ["warmup", "stretch"];
      if (!validTypes.includes(type as string)) {
        return res.status(400).json({ error: "方案类型必须是 warmup 或 stretch" });
      }

      const routine = getRoutine(
        sport as string,
        age as string,
        type as "warmup" | "stretch"
      );

      if (!routine) {
        return res.status(404).json({
          error: `未找到「${sport}」运动的热身方案，请检查运动名称是否正确`,
        });
      }

      res.json(routine);
    } catch (error) {
      console.error("Error fetching routine:", error);
      res.status(500).json({ error: "获取方案失败，请稍后再试" });
    }
  });

  // ===== Vite / 静态文件 =====
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🏃 热身魔法师已就绪！`);
    console.log(`   本地访问: http://localhost:${PORT}`);
    console.log(`   局域网访问: http://<你的IP>:${PORT}`);
    console.log(`   API 端点:`);
    console.log(`   - GET /api/sports     运动列表`);
    console.log(`   - GET /api/age-groups  年龄组列表`);
    console.log(`   - GET /api/routine?sport=swimming&age=6-8&type=warmup`);
    console.log(`   - /videos/              视频文件\n`);
  });
}

startServer();
