import React from "react";
import { log, warn } from "@/utils/logger/logger";

interface PerformanceMetrics {
  renderCount: number;
  slowRenders: number;
  averageRenderTime: number;
  memoryWarnings: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private renderStartTimes: Map<string, number> = new Map();

  static getInstance (): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing a render operation
   */
  startRender (componentName: string): void {
    this.renderStartTimes.set(componentName, performance.now());
  }

  /**
   * End timing a render operation and log if it's slow
   */
  endRender (componentName: string): void {
    const startTime = this.renderStartTimes.get(componentName);
    if (!startTime) return;

    const renderTime = performance.now() - startTime;
    this.renderStartTimes.delete(componentName);

    // Get or create metrics for this component
    const metrics = this.metrics.get(componentName) || {
      renderCount: 0,
      slowRenders: 0,
      averageRenderTime: 0,
      memoryWarnings: 0,
    };

    // Update metrics
    metrics.renderCount++;
    metrics.averageRenderTime =
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;

    // Log if render is slow (> 16ms for 60fps)
    if (renderTime > 16) {
      metrics.slowRenders++;
      warn(
        `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`,
        "PerformanceMonitor"
      );
    }

    this.metrics.set(componentName, metrics);
  }

  /**
   * Log memory warning
   */
  logMemoryWarning (context: string): void {
    warn(`Memory warning in ${context}`, "PerformanceMonitor");

    // Update metrics for the component if it exists
    const metrics = this.metrics.get(context);
    if (metrics) {
      metrics.memoryWarnings++;
      this.metrics.set(context, metrics);
    }
  }

  /**
   * Get performance metrics for a component
   */
  getMetrics (componentName: string): PerformanceMetrics | undefined {
    return this.metrics.get(componentName);
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics (): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Log performance report for debugging
   */
  logPerformanceReport (): void {
    if (this.metrics.size === 0) return;

    log("=== Performance Report ===", "PerformanceMonitor");

    for (const [componentName, metrics] of this.metrics.entries()) {
      const slowRenderPercentage = ((metrics.slowRenders / metrics.renderCount) * 100).toFixed(1);

      log(
        `${componentName}: ${metrics.renderCount} renders, ${metrics.averageRenderTime.toFixed(2)}ms avg, ${slowRenderPercentage}% slow, ${metrics.memoryWarnings} memory warnings`,
        "PerformanceMonitor"
      );
    }

    log("=== End Performance Report ===", "PerformanceMonitor");
  }

  /**
   * Clear all metrics
   */
  clearMetrics (): void {
    this.metrics.clear();
    this.renderStartTimes.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Hook to automatically track component render performance
 */
export function usePerformanceTracker (componentName: string) {
  const monitor = PerformanceMonitor.getInstance();

  // Start timing on mount and each render
  monitor.startRender(componentName);

  // End timing after render
  React.useEffect(() => {
    monitor.endRender(componentName);
  });

  return {
    logMemoryWarning: () => monitor.logMemoryWarning(componentName),
    getMetrics: () => monitor.getMetrics(componentName),
  };
}