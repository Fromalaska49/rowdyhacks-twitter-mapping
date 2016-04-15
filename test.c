#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

int main(void){
	int i, pid;
	for(i = 0; i < 5; i++){
		pid = fork();
	}
	printf("%d\a\n", pid);
	exit(0);
}
