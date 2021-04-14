using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace VotingApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class VotingController : ControllerBase
    {
        private readonly ILogger<VotingController> _logger;
        private readonly IVotingRepository _repository;

        public VotingController(ILogger<VotingController> logger, IVotingRepository repository)
        {
            _logger = logger;
            _repository = repository;
        }

        [HttpGet]
        public IEnumerable<VoteModel> Get()
        {
            return _repository.GetAll();
        }

        [HttpPost]
        public void Put(int voteId)
        {
            _repository.Increment(voteId);
        }

        [HttpDelete]
        public void Reset()
        {
            _repository.Reset();
        }
    }
}
