'use client';

import React, { useState, FormEvent } from 'react';

/**
 * SettingsForm component for user settings management.
 * Handles theme and notification preferences with strict typing.
 * Replace with real data integration as needed.
 */
export const SettingsForm: React.FC = () => {
  const [theme, setTheme] = useState<string>('dark');
  const [notifications, setNotifications] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  /**
   * Handles form submission for settings.
   * @param e FormEvent<HTMLFormElement>
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    // TODO: Integrate with real API for saving settings
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-gray-300 mb-2" htmlFor="theme">
          Theme
        </label>
        <select
          id="theme"
          name="theme"
          className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white w-full"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-300 mb-2" htmlFor="notifications">
          Notifications
        </label>
        <input
          type="checkbox"
          id="notifications"
          name="notifications"
          className="mr-2"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
        <span className="text-gray-300">Enable notifications</span>
      </div>
      <button
        type="submit"
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-2 rounded-md"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
      {success && <div className="text-green-400 font-semibold">Settings saved!</div>}
    </form>
  );
};
