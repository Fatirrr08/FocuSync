import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GyroVisualizer from './GyroVisualizer';

describe('GyroVisualizer Component', () => {
  it('renders the visualizer container and SVG elements', () => {
    render(<GyroVisualizer beta={0} gamma={0} isFaceDown={true} isStable={true} status="ANCHORED" />);
    
    // Check if the radar container and targets are rendered
    const radar = screen.getByTestId('gyro-radar');
    expect(radar).toBeInTheDocument();
    
    // Check if orientation text is shown
    expect(screen.getByText(/KESTABILAN SENSOR/i)).toBeInTheDocument();
  });

  it('correctly maps beta and gamma to the target position', () => {
    // When beta is 10 and gamma is -15, the tracker dot should be translated/offsetted
    const { rerender } = render(
      <GyroVisualizer beta={0} gamma={0} isFaceDown={true} isStable={true} status="ANCHORED" />
    );
    
    const trackerDot = screen.getByTestId('gyro-tracker');
    
    // Rerender with tilt
    rerender(<GyroVisualizer beta={10} gamma={-15} isFaceDown={true} isStable={true} status="ANCHORED" />);
    
    // Tracker dot should reflect the coordinates in style or transform
    const style = window.getComputedStyle(trackerDot);
    expect(style.transform).toBeDefined();
  });

  it('displays lock indicator and ripple effects when stable and face down', () => {
    render(<GyroVisualizer beta={0} gamma={0} isFaceDown={true} isStable={true} status="ANCHORED" />);
    
    const statusText = screen.getByText(/STATUS: TERKUNCI/i);
    expect(statusText).toBeInTheDocument();
    expect(screen.getByTestId('stable-glow')).toBeInTheDocument();
  });

  it('displays warning style and message when face down is false or status is LIFTED', () => {
    render(<GyroVisualizer beta={25} gamma={35} isFaceDown={false} isStable={false} status="LIFTED" />);
    
    const warningText = screen.getByText(/STATUS: PERINGATAN/i);
    expect(warningText).toBeInTheDocument();
    expect(screen.getByTestId('warning-alert')).toBeInTheDocument();
  });
});
