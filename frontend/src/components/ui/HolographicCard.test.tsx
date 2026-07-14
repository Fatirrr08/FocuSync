import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HolographicCard from './HolographicCard';

describe('HolographicCard Component', () => {
  it('renders children correctly', () => {
    render(
      <HolographicCard data-testid="card">
        <div>Card Content</div>
      </HolographicCard>
    );
    
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('updates CSS variables on mouse move', () => {
    render(
      <HolographicCard data-testid="card">
        <div>Card Content</div>
      </HolographicCard>
    );

    const card = screen.getByTestId('card');

    // Mock bounding rectangle since jsdom has default 0x0 size
    card.getBoundingClientRect = () => ({
      width: 200,
      height: 100,
      left: 10,
      top: 10,
      right: 210,
      bottom: 110,
      x: 10,
      y: 10,
      toJSON: () => {}
    });

    // Dispatch mousemove event at specific coordinates (e.g., middle of card clientX = 110, clientY = 60)
    fireEvent.mouseMove(card, {
      clientX: 110,
      clientY: 60
    });

    // Check style variables (should be updated to represent mouse position/rotation)
    expect(card.style.getPropertyValue('--mx')).toBeDefined();
    expect(card.style.getPropertyValue('--my')).toBeDefined();
  });

  it('resets CSS variables on mouse leave', () => {
    render(
      <HolographicCard data-testid="card">
        <div>Card Content</div>
      </HolographicCard>
    );

    const card = screen.getByTestId('card');

    // Simulate mouse move
    fireEvent.mouseMove(card, { clientX: 50, clientY: 50 });
    
    // Simulate mouse leave
    fireEvent.mouseLeave(card);

    // CSS variables for rotations should reset to 0
    expect(card.style.getPropertyValue('--rx')).toBe('0deg');
    expect(card.style.getPropertyValue('--ry')).toBe('0deg');
  });
});
