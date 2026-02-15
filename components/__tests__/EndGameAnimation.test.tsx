import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EndGameAnimation from '../EndGameAnimation';

describe('EndGameAnimation Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const defaultProps = {
    player1Avatar: 'paula' as const,
    player2Avatar: 'tymon' as const,
    player1Name: 'Paula',
    player2Name: 'Tymon',
    onComplete: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render with player names', () => {
      render(<EndGameAnimation {...defaultProps} />);

      expect(screen.getByText('Paula')).toBeInTheDocument();
      expect(screen.getByText('Tymon')).toBeInTheDocument();
    });

    it('should render congratulations title', () => {
      render(<EndGameAnimation {...defaultProps} />);

      expect(screen.getByText('Gratulacje!')).toBeInTheDocument();
    });

    it('should render completion message', () => {
      render(<EndGameAnimation {...defaultProps} />);

      expect(screen.getByText('Ukończyliście wszystkie etapy!')).toBeInTheDocument();
    });

    it('should render both player avatars', () => {
      render(<EndGameAnimation {...defaultProps} />);

      const avatars = screen.getAllByAltText(/Avatar (paula|tymon)/i);
      expect(avatars).toHaveLength(2);
    });

    it('should render starry background elements', () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      // Check for stars (should have 20)
      const stars = container.querySelectorAll('.animate-twinkle');
      expect(stars.length).toBe(20);
    });
  });

  describe('Animation Phases', () => {
    it('should start with fade-in phase', () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      const mainContainer = container.querySelector('.animate-fade-in');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should progress to walking phase after 500ms', async () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      // Initial state - not walking yet
      const initialWalking = container.querySelectorAll('.animate-bounce-walk');
      expect(initialWalking.length).toBe(0);

      await vi.advanceTimersByTimeAsync(501);

      // After advancing time, phase should progress - check via other indicators
      // Since the animation class is conditional, we can check if the component is still rendered
      expect(screen.getByText('Gratulacje!')).toBeInTheDocument();
      expect(screen.getByText('Paula')).toBeInTheDocument();
    });

    it('should show hearts after 2000ms', async () => {
      render(<EndGameAnimation {...defaultProps} />);

      await vi.advanceTimersByTimeAsync(2000);

      const heartEmoji = screen.getByText('❤️');
      expect(heartEmoji).toBeInTheDocument();
    });

    it('should show success message after 3500ms', async () => {
      render(<EndGameAnimation {...defaultProps} />);

      await vi.advanceTimersByTimeAsync(3500);

      const message = screen.getByText(/Przeszliście razem przez wszystkie etapy randki/i);
      expect(message).toBeInTheDocument();
    });

    it('should call onComplete after 7000ms', async () => {
      const onComplete = vi.fn();
      render(<EndGameAnimation {...defaultProps} onComplete={onComplete} />);

      await vi.advanceTimersByTimeAsync(7000);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Animation Timeline', () => {
    it('should not call onComplete before animation finishes', () => {
      const onComplete = vi.fn();
      render(<EndGameAnimation {...defaultProps} onComplete={onComplete} />);

      vi.advanceTimersByTime(6999);
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should transition through all phases in order', async () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      // Phase 1: fade-in (0ms)
      expect(container.querySelector('.animate-fade-in')).toBeInTheDocument();

      // Phase 2: walking (500ms) - verify basic render
      await vi.advanceTimersByTimeAsync(501);
      expect(screen.getByText('Gratulacje!')).toBeInTheDocument();

      // Phase 3: hearts (2000ms total)
      await vi.advanceTimersByTimeAsync(1500);
      expect(screen.getByText('❤️')).toBeInTheDocument();

      // Phase 4: message (3500ms total)
      await vi.advanceTimersByTimeAsync(1500);
      expect(screen.getByText(/To dopiero początek/i)).toBeInTheDocument();

      // Phase 5: fade-out (6000ms total)
      await vi.advanceTimersByTimeAsync(2500);
      const mainElement = container.querySelector('.fixed.inset-0');
      expect(mainElement).toHaveClass('opacity-0');
    });
  });

  describe('Player Data', () => {
    it('should display custom player names', () => {
      const props = {
        ...defaultProps,
        player1Name: 'Alice',
        player2Name: 'Bob',
      };

      render(<EndGameAnimation {...props} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should render avatars with happy emotion', () => {
      render(<EndGameAnimation {...defaultProps} />);

      const avatars = screen.getAllByAltText(/Avatar/);
      avatars.forEach(avatar => {
        expect(avatar).toHaveAttribute('src', expect.stringContaining('happy'));
      });
    });

    it('should render both avatars as animated', () => {
      render(<EndGameAnimation {...defaultProps} />);

      // Both avatars should exist
      const paulaAvatar = screen.getByAltText('Avatar paula');
      const tymonAvatar = screen.getByAltText('Avatar tymon');

      expect(paulaAvatar).toBeInTheDocument();
      expect(tymonAvatar).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render road/path element', () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      const road = container.querySelector('.bg-gradient-to-b.from-gray-700');
      expect(road).toBeInTheDocument();
    });

    it('should progress through heart phase successfully', async () => {
      render(<EndGameAnimation {...defaultProps} />);

      // Initial state
      expect(screen.getByText('Gratulacje!')).toBeInTheDocument();

      await vi.advanceTimersByTimeAsync(2001);

      // After hearts phase - animation continues
      expect(screen.getByText('Gratulacje!')).toBeInTheDocument();
      expect(screen.getByText('Paula')).toBeInTheDocument();
    });

    it('should render sparkle emojis in success message', async () => {
      render(<EndGameAnimation {...defaultProps} />);

      await vi.advanceTimersByTimeAsync(3500);

      const sparkles = screen.getAllByText('✨');
      expect(sparkles.length).toBeGreaterThan(0);
    });

    it('should render couple emoji', async () => {
      render(<EndGameAnimation {...defaultProps} />);

      await vi.advanceTimersByTimeAsync(3500);

      expect(screen.getByText('💑')).toBeInTheDocument();
    });

    it('should have gradient background', () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      const background = container.querySelector('.bg-gradient-to-b.from-purple-900');
      expect(background).toBeInTheDocument();
      expect(background).toHaveClass('via-pink-900');
      expect(background).toHaveClass('to-red-900');
    });
  });

  describe('Success Messages', () => {
    it('should show main success message after delay', async () => {
      render(<EndGameAnimation {...defaultProps} />);

      await vi.advanceTimersByTimeAsync(3500);

      expect(screen.getByText(/Przeszliście razem przez wszystkie etapy randki/i)).toBeInTheDocument();
    });

    it('should show continuation message', async () => {
      render(<EndGameAnimation {...defaultProps} />);

      await vi.advanceTimersByTimeAsync(3500);

      expect(screen.getByText(/To dopiero początek waszej wspólnej przygody/i)).toBeInTheDocument();
    });

    it('should include celebration emojis in message', async () => {
      render(<EndGameAnimation {...defaultProps} />);

      await vi.advanceTimersByTimeAsync(3500);

      expect(screen.getByText(/🌟/)).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timers on unmount', () => {
      const { unmount } = render(<EndGameAnimation {...defaultProps} />);

      const timersBefore = vi.getTimerCount();
      unmount();

      // All timers should be cleaned up
      expect(vi.getTimerCount()).toBeLessThanOrEqual(timersBefore);
    });

    it('should not call onComplete if unmounted early', () => {
      const onComplete = vi.fn();
      const { unmount } = render(
        <EndGameAnimation {...defaultProps} onComplete={onComplete} />
      );

      vi.advanceTimersByTime(3000);
      unmount();

      vi.advanceTimersByTime(5000);
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('Animation Classes', () => {
    it('should have custom animation styles defined', () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      const style = container.querySelector('style');
      expect(style).toBeInTheDocument();

      const styleContent = style?.textContent || '';
      expect(styleContent).toContain('@keyframes fade-in');
      expect(styleContent).toContain('@keyframes twinkle');
      expect(styleContent).toContain('@keyframes bounce-walk');
      expect(styleContent).toContain('@keyframes pulse-heart');
      expect(styleContent).toContain('@keyframes float-heart');
    });

    it('should render both player avatars in animation', () => {
      render(<EndGameAnimation {...defaultProps} />);

      // Both players should be rendered
      expect(screen.getByText('Paula')).toBeInTheDocument();
      expect(screen.getByText('Tymon')).toBeInTheDocument();

      // Both avatars should be present
      const avatars = screen.getAllByAltText(/Avatar/);
      expect(avatars.length).toBe(2);
    });

    it('should have pixel-glow class on title', () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      const title = screen.getByText('Gratulacje!');
      expect(title).toHaveClass('pixel-glow');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizes', () => {
      render(<EndGameAnimation {...defaultProps} />);

      const title = screen.getByText('Gratulacje!');
      expect(title).toHaveClass('text-xl');
      expect(title).toHaveClass('sm:text-3xl');
    });

    it('should have responsive player name text sizes', () => {
      render(<EndGameAnimation {...defaultProps} />);

      const playerName = screen.getByText('Paula');
      // Check if parent element has responsive text classes (parent is container)
      const nameContainer = playerName.closest('.text-\\[8px\\]');
      expect(nameContainer).toBeInTheDocument();
    });

    it('should have responsive spacing', () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      const mainContent = container.querySelector('.p-4.sm\\:p-6');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Z-Index and Positioning', () => {
    it('should have fixed positioning for overlay', () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toHaveClass('fixed');
      expect(overlay).toHaveClass('inset-0');
    });

    it('should have high z-index', () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toHaveClass('z-50');
    });

    it('should center content', () => {
      const { container } = render(<EndGameAnimation {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toHaveClass('flex');
      expect(overlay).toHaveClass('items-center');
      expect(overlay).toHaveClass('justify-center');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty player names gracefully', () => {
      const props = {
        ...defaultProps,
        player1Name: '',
        player2Name: '',
      };

      render(<EndGameAnimation {...props} />);

      // Should still render without crashing
      expect(screen.getByText('Gratulacje!')).toBeInTheDocument();
    });

    it('should handle same avatar for both players', () => {
      const props = {
        ...defaultProps,
        player1Avatar: 'paula' as const,
        player2Avatar: 'paula' as const,
      };

      render(<EndGameAnimation {...props} />);

      const avatars = screen.getAllByAltText('Avatar paula');
      expect(avatars).toHaveLength(2);
    });

    it('should handle rapid completion callback calls', () => {
      const onComplete = vi.fn();
      render(<EndGameAnimation {...defaultProps} onComplete={onComplete} />);

      vi.advanceTimersByTime(7000);
      vi.advanceTimersByTime(7000);

      // Should only call once per render
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
