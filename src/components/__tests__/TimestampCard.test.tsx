import React from "react";
import { render, screen } from "@testing-library/react";
import { TimestampCard } from "../TimestampCard";
import { PngTimestamp } from "../../types/png-metadata";

describe("TimestampCard", () => {
  const mockTimestamp: PngTimestamp = {
    year: 2024,
    month: 1,
    day: 15,
    hour: 14,
    minute: 30,
    second: 45,
    date: new Date(2024, 0, 15, 14, 30, 45),
  };

  describe("日時表示テスト", () => {
    test("should render timestamp information", () => {
      render(<TimestampCard timestamp={mockTimestamp} />);
      
      expect(screen.getByText(/2024年1月15日/)).toBeInTheDocument();
      expect(screen.getByText(/14:30:45/)).toBeInTheDocument();
    });

    test("should display formatted date and time", () => {
      render(<TimestampCard timestamp={mockTimestamp} />);
      
      const formattedDate = screen.getByText(/2024年1月15日 14:30:45/);
      expect(formattedDate).toBeInTheDocument();
    });

    test("should display relative time", () => {
      // 2日前の日付を作成
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      
      const pastTimestamp: PngTimestamp = {
        year: pastDate.getFullYear(),
        month: pastDate.getMonth() + 1,
        day: pastDate.getDate(),
        hour: pastDate.getHours(),
        minute: pastDate.getMinutes(),
        second: pastDate.getSeconds(),
        date: pastDate,
      };
      
      render(<TimestampCard timestamp={pastTimestamp} />);
      
      expect(screen.getByText(/2日前/)).toBeInTheDocument();
    });

    test("should handle different date formats", () => {
      const newYearTimestamp: PngTimestamp = {
        year: 2024,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        date: new Date(2024, 11, 31, 23, 59, 59),
      };
      
      render(<TimestampCard timestamp={newYearTimestamp} />);
      
      expect(screen.getByText(/2024年12月31日/)).toBeInTheDocument();
      expect(screen.getByText(/23:59:59/)).toBeInTheDocument();
    });

    test("should handle invalid dates", () => {
      const invalidTimestamp: PngTimestamp = {
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
        date: new Date("invalid"),
      };
      
      render(<TimestampCard timestamp={invalidTimestamp} />);
      
      expect(screen.getByText(/無効な日付/)).toBeInTheDocument();
    });
  });

  describe("タイムゾーン処理テスト", () => {
    test("should display timezone information", () => {
      render(<TimestampCard timestamp={mockTimestamp} />);
      
      // UTCとして扱われるため、タイムゾーン情報が表示される
      expect(screen.getByText(/UTC/)).toBeInTheDocument();
    });

    test("should handle UTC time", () => {
      const utcTimestamp: PngTimestamp = {
        ...mockTimestamp,
        date: new Date(Date.UTC(2024, 0, 15, 14, 30, 45)),
      };
      
      render(<TimestampCard timestamp={utcTimestamp} />);
      
      expect(screen.getByText(/UTC/)).toBeInTheDocument();
    });

    test("should calculate relative time correctly", () => {
      // 1時間前の日付を作成
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const recentTimestamp: PngTimestamp = {
        year: oneHourAgo.getFullYear(),
        month: oneHourAgo.getMonth() + 1,
        day: oneHourAgo.getDate(),
        hour: oneHourAgo.getHours(),
        minute: oneHourAgo.getMinutes(),
        second: oneHourAgo.getSeconds(),
        date: oneHourAgo,
      };
      
      render(<TimestampCard timestamp={recentTimestamp} />);
      
      expect(screen.getByText(/1時間前/)).toBeInTheDocument();
    });
  });
});