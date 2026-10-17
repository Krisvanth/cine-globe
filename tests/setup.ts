import '@testing-library/jest-dom';

// Ensure test runner executes deterministically in hermetic offline mode
delete process.env.TMDB_API_KEY;
