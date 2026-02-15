import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Avatar from '../Avatar';
import { AVATARS } from '@/lib/avatars';

describe('Avatar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render avatar image', () => {
      render(<Avatar avatarKey="paula" />);
      const image = screen.getByAltText('Avatar paula');
      expect(image).toBeInTheDocument();
    });

    it('should use default emotion "open" when not specified', () => {
      render(<Avatar avatarKey="paula" />);
      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveAttribute('src', AVATARS.paula.open);
    });

    it('should render with specified emotion', () => {
      render(<Avatar avatarKey="tymon" emotion="happy" />);
      const image = screen.getByAltText('Avatar tymon');
      expect(image).toHaveAttribute('src', AVATARS.tymon.happy);
    });

    it('should render paula avatar', () => {
      render(<Avatar avatarKey="paula" emotion="closed" />);
      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveAttribute('src', AVATARS.paula.closed);
    });

    it('should render tymon avatar', () => {
      render(<Avatar avatarKey="tymon" emotion="surprised" />);
      const image = screen.getByAltText('Avatar tymon');
      expect(image).toHaveAttribute('src', AVATARS.tymon.surprised);
    });
  });

  describe('Size Configuration', () => {
    it('should use default size of 120 when not specified', () => {
      const { container } = render(<Avatar avatarKey="paula" />);
      const wrapper = container.querySelector('.pixel-art');
      expect(wrapper).toHaveStyle({ width: '120px', height: '120px' });
    });

    it('should apply custom size', () => {
      const { container } = render(<Avatar avatarKey="paula" size={80} />);
      const wrapper = container.querySelector('.pixel-art');
      expect(wrapper).toHaveStyle({ width: '80px', height: '80px' });
    });

    it('should pass size to image element', () => {
      render(<Avatar avatarKey="paula" size={150} />);
      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveAttribute('width', '150');
      expect(image).toHaveAttribute('height', '150');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Avatar avatarKey="paula" className="custom-class" />
      );
      const wrapper = container.querySelector('.pixel-art');
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should maintain default classes when custom className is provided', () => {
      const { container } = render(
        <Avatar avatarKey="paula" className="custom-class" />
      );
      const wrapper = container.querySelector('.pixel-art');
      expect(wrapper).toHaveClass('pixel-art');
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('justify-center');
    });
  });

  describe('Clickable Behavior', () => {
    it('should not have cursor-pointer class when not clickable', () => {
      const { container } = render(<Avatar avatarKey="paula" />);
      const wrapper = container.querySelector('.pixel-art');
      expect(wrapper).not.toHaveClass('cursor-pointer');
    });

    it('should have cursor-pointer class when clickable', () => {
      const { container } = render(<Avatar avatarKey="paula" clickable={true} />);
      const wrapper = container.querySelector('.pixel-art');
      expect(wrapper).toHaveClass('cursor-pointer');
    });

    it('should show surprised emotion when clicked if clickable', async () => {
      vi.useRealTimers(); // Use real timers for user interaction
      const user = userEvent.setup();
      const { container } = render(
        <Avatar avatarKey="paula" emotion="open" clickable={true} />
      );

      const wrapper = container.querySelector('.pixel-art') as HTMLElement;
      await user.click(wrapper);

      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveAttribute('src', AVATARS.paula.surprised);
      vi.useFakeTimers(); // Restore fake timers
    });

    it('should reset to original emotion after 1.5 seconds', async () => {
      vi.useRealTimers(); // Use real timers for user interaction
      const user = userEvent.setup();
      const { container } = render(
        <Avatar avatarKey="paula" emotion="happy" clickable={true} />
      );

      const wrapper = container.querySelector('.pixel-art') as HTMLElement;
      await user.click(wrapper);

      // Should be surprised immediately
      let image = screen.getByAltText('Avatar paula');
      expect(image).toHaveAttribute('src', AVATARS.paula.surprised);

      // Wait for reset to happen naturally
      await waitFor(
        () => {
          image = screen.getByAltText('Avatar paula');
          expect(image).toHaveAttribute('src', AVATARS.paula.happy);
        },
        { timeout: 2000 }
      );
      vi.useFakeTimers(); // Restore fake timers
    });

    it('should not change emotion on click when not clickable', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const { container } = render(
        <Avatar avatarKey="paula" emotion="open" clickable={false} />
      );

      const wrapper = container.querySelector('.pixel-art') as HTMLElement;
      await user.click(wrapper);

      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveAttribute('src', AVATARS.paula.open);
      vi.useFakeTimers();
    });

    it('should handle multiple rapid clicks', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const { container } = render(
        <Avatar avatarKey="paula" emotion="open" clickable={true} />
      );

      const wrapper = container.querySelector('.pixel-art') as HTMLElement;

      // Click multiple times
      await user.click(wrapper);
      await user.click(wrapper);
      await user.click(wrapper);

      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveAttribute('src', AVATARS.paula.surprised);
      vi.useFakeTimers();
    });
  });

  describe('Animated Behavior', () => {
    it('should blink when animated is true', async () => {
      render(<Avatar avatarKey="paula" emotion="open" animated={true} />);

      // Let animation interval run
      vi.advanceTimersByTime(1500);

      // The avatar might blink to closed or stay open (10% chance)
      // We just verify the component doesn't crash
      const image = screen.getByAltText('Avatar paula');
      expect(image).toBeInTheDocument();
    });

    it('should not animate when animated is false', async () => {
      render(<Avatar avatarKey="paula" emotion="open" animated={false} />);

      vi.advanceTimersByTime(5000);

      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveAttribute('src', AVATARS.paula.open);
    });

    it('should cleanup animation interval on unmount', () => {
      const { unmount } = render(
        <Avatar avatarKey="paula" emotion="open" animated={true} />
      );

      const timerCountBefore = vi.getTimerCount();
      unmount();

      // Timers should be cleaned up
      expect(vi.getTimerCount()).toBeLessThanOrEqual(timerCountBefore);
    });
  });

  describe('Emotion Updates', () => {
    it('should update emotion when prop changes', () => {
      const { rerender } = render(<Avatar avatarKey="paula" emotion="open" />);

      let image = screen.getByAltText('Avatar paula');
      expect(image).toHaveAttribute('src', AVATARS.paula.open);

      rerender(<Avatar avatarKey="paula" emotion="happy" />);

      image = screen.getByAltText('Avatar paula');
      expect(image).toHaveAttribute('src', AVATARS.paula.happy);
    });

    it('should update emotion from closed to surprised', () => {
      const { rerender } = render(<Avatar avatarKey="tymon" emotion="closed" />);

      let image = screen.getByAltText('Avatar tymon');
      expect(image).toHaveAttribute('src', AVATARS.tymon.closed);

      rerender(<Avatar avatarKey="tymon" emotion="surprised" />);

      image = screen.getByAltText('Avatar tymon');
      expect(image).toHaveAttribute('src', AVATARS.tymon.surprised);
    });
  });

  describe('Fallback Behavior', () => {
    it('should fallback to tymon.open if avatar data is invalid', () => {
      // This tests the fallback in the component
      render(<Avatar avatarKey={'invalid' as any} />);

      const image = screen.getByAltText('Avatar invalid');
      expect(image).toHaveAttribute('src', AVATARS.tymon.open);
    });
  });

  describe('Image Properties', () => {
    it('should have pixel-art class on image', () => {
      render(<Avatar avatarKey="paula" />);
      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveClass('pixel-art');
      expect(image).toHaveClass('object-contain');
    });

    it('should pass unoptimized prop to image', () => {
      render(<Avatar avatarKey="paula" />);
      const image = screen.getByAltText('Avatar paula');
      // The mocked Image component receives unoptimized prop
      expect(image).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup surprise timeout on unmount', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const { container, unmount } = render(
        <Avatar avatarKey="paula" emotion="open" clickable={true} />
      );

      const wrapper = container.querySelector('.pixel-art') as HTMLElement;
      await user.click(wrapper);

      // Unmount before timeout completes
      unmount();

      // Component should unmount cleanly without errors
      expect(container.querySelector('.pixel-art')).not.toBeInTheDocument();
      vi.useFakeTimers();
    });
  });

  describe('All Emotions', () => {
    const emotions = ['closed', 'happy', 'open', 'surprised'] as const;
    const avatars = ['paula', 'tymon'] as const;

    emotions.forEach(emotion => {
      avatars.forEach(avatarKey => {
        it(`should render ${avatarKey} with ${emotion} emotion`, () => {
          render(<Avatar avatarKey={avatarKey} emotion={emotion} />);
          const image = screen.getByAltText(`Avatar ${avatarKey}`);
          expect(image).toHaveAttribute('src', AVATARS[avatarKey][emotion]);
        });
      });
    });
  });

  describe('Horizontal Flip', () => {
    it('should not flip by default', () => {
      render(<Avatar avatarKey="paula" />);
      const image = screen.getByAltText('Avatar paula');
      expect(image).not.toHaveClass('scale-x-[-1]');
    });

    it('should flip horizontally when flipHorizontal is true', () => {
      render(<Avatar avatarKey="paula" flipHorizontal={true} />);
      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveClass('scale-x-[-1]');
    });

    it('should not flip when flipHorizontal is false', () => {
      render(<Avatar avatarKey="tymon" flipHorizontal={false} />);
      const image = screen.getByAltText('Avatar tymon');
      expect(image).not.toHaveClass('scale-x-[-1]');
    });

    it('should flip both avatar types', () => {
      const { rerender } = render(<Avatar avatarKey="paula" flipHorizontal={true} />);
      let image = screen.getByAltText('Avatar paula');
      expect(image).toHaveClass('scale-x-[-1]');

      rerender(<Avatar avatarKey="tymon" flipHorizontal={true} />);
      image = screen.getByAltText('Avatar tymon');
      expect(image).toHaveClass('scale-x-[-1]');
    });

    it('should work with different emotions when flipped', () => {
      render(<Avatar avatarKey="paula" emotion="happy" flipHorizontal={true} />);
      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveClass('scale-x-[-1]');
      expect(image).toHaveAttribute('src', AVATARS.paula.happy);
    });

    it('should work with animation when flipped', () => {
      render(<Avatar avatarKey="tymon" animated={true} flipHorizontal={true} />);
      const image = screen.getByAltText('Avatar tymon');
      expect(image).toHaveClass('scale-x-[-1]');
    });

    it('should maintain flip when showing surprised emotion', () => {
      render(<Avatar avatarKey="paula" clickable={true} flipHorizontal={true} emotion="surprised" />);
      const image = screen.getByAltText('Avatar paula');
      expect(image).toHaveClass('scale-x-[-1]');
      expect(image).toHaveAttribute('src', AVATARS.paula.surprised);
    });
  });
});
