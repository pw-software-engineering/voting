using System;
using System.Collections.Generic;
using System.Linq;

namespace VotingApi
{
    public class InMemoryVotingRepository : IVotingRepository
    {
        private Dictionary<int, VoteModel> _repository;

        public InMemoryVotingRepository()
        {
            Initialize();
        }

        public IEnumerable<VoteModel> GetAll()
        {
            return _repository.Values.ToArray();
        }

        public void Increment(int voteId)
        {
            _repository[voteId].NumberOfVotes++;
        }

        public void Reset()
        {
            Initialize();
        }

        private void Initialize()
        {
            _repository = new Dictionary<int, VoteModel>
            {
                [0] = new() { Id = 0, Name = "Cats", NumberOfVotes = 0 },
                [1] = new() { Id = 1, Name = "Dogs", NumberOfVotes = 1 }
            };
        }
    }
}
