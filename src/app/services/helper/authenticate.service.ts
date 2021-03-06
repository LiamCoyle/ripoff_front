import { Injectable } from '@angular/core';
import { Observable, of, Subject} from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../user.service';
import * as jwt_decode from "jwt-decode";
import { UrlHandlingStrategy } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const endPoint = 'http://localhost:8080/';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private _userSubject: BehaviorSubject<any>;

  constructor(private http:HttpClient, private userService : UserService) {
    this._userSubject = new BehaviorSubject<any>(localStorage.getItem('currentToken'));
  }

  public get currentTokenValue(): any {
    return this._userSubject.value; 
  }


  public getUserFromToken(token, callback){
    let decodedToken = jwt_decode(token);
    console.log("decoded token", decodedToken);
    if(decodedToken.id){
      this.userService.getUser(decodedToken.id).subscribe(user=>{
        console.log("find user by id in token", user);
        return callback(user);
      });
    }else{
      return callback(null);
    }
    
  }

  public get currentUserSubject(): any {
    return this._userSubject;
  }

  public login(mail : string, password : string) : Observable<any>{
    var obj = {'mail': mail, 'password': password};
    return this.http.post(endPoint+'authenticate',obj)
    .pipe(map(token   => {
      console.log("login token", token);
      // login successful if there's a jwt token in the response
      if (token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentToken', token.toString() );
          this._userSubject.next(token);
          //this.currentUser = JSON.stringify(user);
      }

      return token;
    }));
  }

  public logout(){
    this._userSubject.next(null);
    localStorage.removeItem('currentToken');
  }
}
