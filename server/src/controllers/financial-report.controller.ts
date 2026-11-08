import type { Request, Response } from "express";
import { getFinancialReport } from "../services/financial-report.service.js";

export async function financialReportController(
  req: Request,
  res: Response
): Promise<void> {
  const workspaceId = req.params.workspaceId;

  if (!workspaceId) {
    res.status(400).json({
      error: "Workspace ID is required",
    });
    return;
  }

  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  if (
    (startDate !== undefined &&
      (typeof startDate !== "string" ||
        Number.isNaN(Date.parse(startDate)))) ||
    (endDate !== undefined &&
      (typeof endDate !== "string" ||
        Number.isNaN(Date.parse(endDate))))
  ) {
    res.status(400).json({
      error: "Invalid date filter",
    });
    return;
  }

  const parsedStartDate =
    typeof startDate === "string"
      ? new Date(startDate)
      : undefined;

  const parsedEndDate =
    typeof endDate === "string"
      ? new Date(endDate)
      : undefined;

  if (
    parsedStartDate &&
    parsedEndDate &&
    parsedStartDate > parsedEndDate
  ) {
    res.status(400).json({
      error: "Start date cannot be after end date",
    });
    return;
  }

  try {
    const report = await getFinancialReport(workspaceId, {
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });

    res.status(200).json({ report });
  } catch (error) {
    console.error("Financial report error:", error);

    res.status(500).json({
      error: "Unable to generate financial report",
    });
  }
}
