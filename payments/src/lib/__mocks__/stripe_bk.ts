// not mocking this anymore since I'm now using the stripe dev environemt
// in tests

export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({}),
  },
}
