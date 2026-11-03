import { Server, type IServerInput } from './server.model';

const input = {
  serverId: 'guild-1',
  name: 'Test',
  adminRoleIds: [],
  modRoleIds: [],
  playerList: [],
  regions: [],
  discovery: { enabled: false },
} as unknown as IServerInput;

describe('Server.findOrCreateServer', () => {
  it('creates when none exists', async () => {
    const doc = { serverId: 'guild-1' };
    jest.spyOn(Server, 'findOne').mockResolvedValue(null as never);
    jest.spyOn(Server, 'create').mockResolvedValue(doc as never);
    await expect(Server.findOrCreateServer(input)).resolves.toEqual({
      server: doc,
      created: true,
    });
  });

  it('returns the existing server without creating', async () => {
    const doc = { serverId: 'guild-1' };
    jest.spyOn(Server, 'findOne').mockResolvedValue(doc as never);
    const create = jest.spyOn(Server, 'create');
    await expect(Server.findOrCreateServer(input)).resolves.toEqual({
      server: doc,
      created: false,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('returns the winner when a concurrent insert hits the unique index', async () => {
    const winner = { serverId: 'guild-1' };
    jest
      .spyOn(Server, 'findOne')
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(winner as never);
    jest.spyOn(Server, 'create').mockRejectedValue({ code: 11000 });
    await expect(Server.findOrCreateServer(input)).resolves.toEqual({
      server: winner,
      created: false,
    });
  });

  it('rethrows other errors', async () => {
    jest.spyOn(Server, 'findOne').mockResolvedValue(null as never);
    jest.spyOn(Server, 'create').mockRejectedValue(new Error('boom'));
    await expect(Server.findOrCreateServer(input)).rejects.toThrow('boom');
  });
});
