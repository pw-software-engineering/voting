using System.Collections.Generic;

namespace VotingApi
{
    public interface IVotingRepository
    {
        IEnumerable<VoteModel> GetAll();

        void Increment(int voteId);

        void Reset();
    }
}
