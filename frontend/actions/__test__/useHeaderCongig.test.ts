import { renderHook, act } from '@testing-library/react-native';
import { useFocusEffect } from 'expo-router';
import { useHeader } from '@/context/HeaderContext';
import { useHeaderConfig } from '../useHeaderConfig';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('@/context/HeaderContext', () => ({
  useHeader: jest.fn(),
}));

describe('useHeaderConfig', () => {
  const setTitleMock = jest.fn();
  const setShowBackMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useHeader as jest.Mock).mockReturnValue({
      setTitle: setTitleMock,
      setShowBack: setShowBackMock,
    });
  });

  (useFocusEffect as jest.Mock).mockImplementation((callback) => {
    callback(); // Directly invoke the callback to simulate focus
});

it('should set the header title and back button visibility when the screen is focused', () => {


    renderHook(() => useHeaderConfig('Test Title', true));

    expect(setTitleMock).toHaveBeenCalledWith('Test Title');
    expect(setShowBackMock).toHaveBeenCalledWith(true);
    expect(useFocusEffect).toHaveBeenCalled(); // Ensure useFocusEffect was called
});

  it('should set the header title and hide the back button when showBack is false', () => {
    renderHook(() => useHeaderConfig('Another Title', false));

    expect(setTitleMock).toHaveBeenCalledWith('Another Title');
    expect(setShowBackMock).toHaveBeenCalledWith(false);
  });

  it('should default showBack to true if not provided', () => {
    renderHook(() => useHeaderConfig('Default Back Button'));

    expect(setTitleMock).toHaveBeenCalledWith('Default Back Button');
    expect(setShowBackMock).toHaveBeenCalledWith(true);
  });

  it('should update the header when title or showBack changes', () => {
    const { rerender } = renderHook(
      ({ title, showBack }) => useHeaderConfig(title, showBack),
      {
        initialProps: { title: 'Initial Title', showBack: true },
      }
    );

    expect(setTitleMock).toHaveBeenCalledWith('Initial Title');
    expect(setShowBackMock).toHaveBeenCalledWith(true);

    rerender({ title: 'Updated Title', showBack: false });

    expect(setTitleMock).toHaveBeenCalledWith('Updated Title');
    expect(setShowBackMock).toHaveBeenCalledWith(false);
  });
});