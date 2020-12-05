// mocking the nats wrapper because we don't want to communicate to the nats server in our
// isolated service tests

export const natsWrapper = {
  connect: (): Promise<void> => new Promise((res) => res()),
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => callback()
      ),
  },
}
