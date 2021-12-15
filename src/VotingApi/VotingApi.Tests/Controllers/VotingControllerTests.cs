using Castle.Core.Logging;
using Microsoft.Extensions.Logging;
using Moq;
using VotingApi.Controllers;
using VotingApi.Model;
using Xunit;

namespace VotingApi.Tests.Controllers
{
    public class VotingControllerTests
    {
        private readonly Mock<IVotingRepository> _repository;
        private VotingController _controller;

        public VotingControllerTests()
        {
            var logger = new Mock<ILogger<VotingController>>();
            _repository = new Mock<IVotingRepository>();
            _controller = new VotingController(logger.Object, _repository.Object);
        }

        public class WhenGetIsCalled : VotingControllerTests
        {
            [Fact]
            public void ItShouldReturnResultFromRepositoryGetAll()
            {
                //Arrange
                var expected = new[]
                {
                    new VoteModel {Id = 1, Name = "First", NumberOfVotes = 0},
                    new VoteModel {Id = 2, Name = "Second", NumberOfVotes = 1}
                };
                _repository.Setup(s => s.GetAll()).Returns(expected);

                //Act
                var actual = _controller.Get();

                //Assert
                _repository.Verify(s => s.GetAll(), Times.Exactly(1));
                _repository.VerifyNoOtherCalls();
                Assert.Equal(expected, actual);
            }
        }

        public class WhenPutIsCalled : VotingControllerTests
        {
            [Fact]
            public void ItShouldCallIncrement()
            {
                var model = new VotingRequest {VoteId = 1};
                
                _controller.Put(model);

                _repository.Verify(s => s.Increment(It.Is<int>(i => i == model.VoteId)), Times.Exactly(1));
                _repository.VerifyNoOtherCalls();

            }
        }

        public class WhenResetIsCalled : VotingControllerTests
        {
            [Fact]
            public void ItShouldCallResetOnTheRepository()
            {
                _controller.Reset();

                _repository.Verify(s => s.Reset(), Times.Exactly(1));
                _repository.VerifyNoOtherCalls();
            }
        }
    }
}
