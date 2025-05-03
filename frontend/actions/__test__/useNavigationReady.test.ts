import { renderHook, act } from '@testing-library/react-native';
import { useNavigationReadyStable } from '../useNavigationReadyStable';
import { useRootNavigationState } from 'expo-router';

jest.mock('expo-router', () => ({
  useRootNavigationState: jest.fn(),
}));

describe('useNavigationReadyStable', () => {
  it('should return false initially', () => {
    (useRootNavigationState as jest.Mock).mockReturnValueOnce(null);

    const { result } = renderHook(() => useNavigationReadyStable());

    expect(result.current).toBe(false);
  });

  it('should return true when navKey is set', () => {
    (useRootNavigationState as jest.Mock).mockReturnValueOnce({ key: 'test-key' });

    const { result, rerender } = renderHook(() => useNavigationReadyStable());

    act(() => {
      rerender({});
    });

    expect(result.current).toBe(true);
  });

  it('should not set ready to true again if already true', () => {
    (useRootNavigationState as jest.Mock).mockReturnValueOnce({ key: 'test-key' });

    const { result, rerender } = renderHook(() => useNavigationReadyStable());

    act(() => {
      rerender({});
    });

    expect(result.current).toBe(true);

    (useRootNavigationState as jest.Mock).mockReturnValueOnce({ key: 'new-key' });

    act(() => {
      rerender({});
    });

    expect(result.current).toBe(true); // Should remain true
  });
});