
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";

import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { IGetStatementOperationDTO } from "./IGetStatementOperationDTO";





let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let authenticateUserUseCase: AuthenticateUserUseCase;

let getStatementOperationUseCase: GetStatementOperationUseCase; 

interface IRequest {
  user_id: string;
}

describe("Get Statement",()=>{

  beforeAll(()=>{

    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();   
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository,inMemoryStatementsRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });


  it("Should be able to get statement",async ()=>{
    
    const user: ICreateUserDTO = {
      name: "NewUserTest",
      email: "newusertest@email.com",
      password: "123456"
    }
    await createUserUseCase.execute(user);

    const userAuth : IAuthenticateUserResponseDTO = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const deposit: ICreateStatementDTO = {
      user_id: userAuth.user.id as string,      
      type: 'deposit' as any,
      amount: 500,
      description: "Deposito online"
    }
    const depositResult = await createStatementUseCase.execute(deposit);

    const getStantementOperation: IGetStatementOperationDTO ={
      statement_id: depositResult.id as string,
      user_id: userAuth.user.id as string
    }

    const response = await  getStatementOperationUseCase.execute(getStantementOperation);


    expect(response).toHaveProperty("id");
    expect(response.user_id).toEqual(userAuth.user.id);
    expect(response.description).toEqual("Deposito online");

  });

  it("Should be not able to get statement from non-existing user", async () => {
    expect(async () => {
      const user_id = "userFail"
      const statement_id = "statementFail"
      await getStatementOperationUseCase.execute({
        user_id,
        statement_id
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });

  it("Should be not able to get non-existing statement", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "NewUserTest2",
        email: "newusertest2@email.com",
        password: "123456"
      }
      await createUserUseCase.execute(user);
  
      const userAuth : IAuthenticateUserResponseDTO = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password
      });

      const getStantementOperation: IGetStatementOperationDTO ={
        statement_id: "statementFail",
        user_id: userAuth.user.id as string
      }
      
      await getStatementOperationUseCase.execute(getStantementOperation);

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })  

});