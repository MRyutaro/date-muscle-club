"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

interface RepsPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const RepsPicker = ({
  value,
  onChange,
  min = 0,
  max = 30,
}: RepsPickerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 回数の選択肢を生成
  const reps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  // 現在の値のインデックスを取得
  const getCurrentIndex = (val: number) => {
    return reps.findIndex((r) => r >= val) || 0;
  };

  const currentIndex = getCurrentIndex(value);

  // 表示する回数の範囲を計算（現在の値の前後2つずつ）
  const visibleReps = reps.slice(
    Math.max(0, currentIndex - 2),
    Math.min(reps.length, currentIndex + 3)
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartValue(value);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaY = startY - e.touches[0].clientY;
    const deltaValue = Math.round(deltaY / 10);
    const newValue = Math.max(min, Math.min(max, startValue + deltaValue));
    onChange(newValue);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;
    const deltaValue = Math.round(deltaY / 10);
    const newValue = Math.max(min, Math.min(max, startValue + deltaValue));
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newValue = Math.min(max, value + 1);
      onChange(newValue);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newValue = Math.max(min, value - 1);
      onChange(newValue);
    }
  };

  const handleClick = (rep: number) => {
    onChange(rep);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.sign(e.deltaY) * -1;
      const newValue = Math.max(min, Math.min(max, value + delta));
      onChange(newValue);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [value, onChange, min, max]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: isMobile ? 120 : 150,
        overflow: "hidden",
        position: "relative",
        cursor: "ns-resize",
        userSelect: "none",
        touchAction: "none",
        bgcolor: theme.palette.background.paper,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        "&::before, &::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          height: "40%",
          pointerEvents: "none",
          zIndex: 1,
        },
        "&::before": {
          top: 0,
          background: `linear-gradient(to bottom, ${theme.palette.background.paper}, transparent)`,
        },
        "&::after": {
          bottom: 0,
          background: `linear-gradient(to top, ${theme.palette.background.paper}, transparent)`,
        },
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          py: 1,
        }}
      >
        {visibleReps.map((rep) => (
          <Typography
            key={rep}
            variant={isMobile ? "h6" : "h5"}
            onClick={() => handleClick(rep)}
            sx={{
              my: 0.5,
              opacity: rep === value ? 1 : 0.3,
              transform: `scale(${rep === value ? 1 : 0.8})`,
              transition: "all 0.2s ease",
              fontWeight: rep === value ? "bold" : "normal",
              color: rep === value ? theme.palette.primary.main : "inherit",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            {rep} 回
          </Typography>
        ))}
      </Box>
    </Box>
  );
};
