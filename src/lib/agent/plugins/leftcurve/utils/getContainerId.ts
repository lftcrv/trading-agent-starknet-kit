import * as fs from 'fs';

/**
 * Gets the container ID from /etc/hostname
 * @returns {string} The container ID or a fallback ID if not available
 */
export const getContainerId = (): string => {
  try {
    // Read container ID from /etc/hostname
    const hostname = fs.readFileSync('/etc/hostname', 'utf8').trim();
    return hostname;
  } catch (error) {
    console.error('Error reading container ID from hostname:', error);
    // Return a fallback ID if the hostname file can't be read
    return 'unknown-container-id';
  }
};
